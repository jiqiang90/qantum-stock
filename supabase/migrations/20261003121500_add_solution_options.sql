create table public.solution_options (
  id uuid primary key,
  work_package_id uuid not null
    references public.work_packages (id) on delete cascade,
  solution_id uuid not null references public.solutions (id),
  constraint solution_options_solution_unique
    unique (work_package_id, solution_id),
  constraint solution_options_owner_identity_unique
    unique (work_package_id, id)
);

alter table public.work_packages
  add column selected_solution_option_id uuid;

insert into public.solution_options (id, work_package_id, solution_id)
select gen_random_uuid(), id, solution_id
from public.work_packages;

update public.work_packages as work_package
set selected_solution_option_id = solution_option.id
from public.solution_options as solution_option
where solution_option.work_package_id = work_package.id
  and solution_option.solution_id = work_package.solution_id;

alter table public.product_requirements
  add column solution_option_id uuid;

update public.product_requirements as requirement
set solution_option_id = work_package.selected_solution_option_id
from public.work_packages as work_package
where work_package.id = requirement.work_package_id;

drop trigger product_requirements_solution_match
  on public.product_requirements;
drop trigger work_packages_solution_match on public.work_packages;
drop trigger solution_products_work_package_match
  on public.solution_products;

drop function public.enforce_product_requirement_solution_match();
drop function public.enforce_work_package_solution_match();
drop function public.enforce_solution_product_work_package_match();

alter table public.product_requirements
  drop constraint product_requirements_position_unique,
  drop constraint product_requirements_work_package_id_fkey,
  drop column work_package_id,
  alter column solution_option_id set not null,
  add constraint product_requirements_solution_option_id_fkey
    foreign key (solution_option_id)
    references public.solution_options (id) on delete cascade,
  add constraint product_requirements_position_unique
    unique (solution_option_id, position);

alter table public.work_packages
  drop constraint work_packages_solution_id_fkey,
  drop column solution_id,
  alter column selected_solution_option_id set not null,
  add constraint work_packages_selected_option_owner_fkey
    foreign key (id, selected_solution_option_id)
    references public.solution_options (work_package_id, id)
    deferrable initially deferred;

create index solution_options_solution_id_idx
  on public.solution_options (solution_id);

create index product_requirements_solution_option_id_idx
  on public.product_requirements (solution_option_id);

create function public.enforce_option_requirement_solution_match()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.solution_product_id is not null and not exists (
    select 1
    from public.solution_options as solution_option
    join public.solution_products as mapping
      on mapping.id = new.solution_product_id
    where solution_option.id = new.solution_option_id
      and solution_option.solution_id = mapping.solution_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'Product Requirement mapping must belong to the Solution Option';
  end if;

  return new;
end;
$$;

create trigger option_requirements_solution_match
before insert or update of solution_option_id, solution_product_id
on public.product_requirements
for each row
execute function public.enforce_option_requirement_solution_match();

create function public.enforce_solution_option_requirement_match()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.product_requirements as requirement
    join public.solution_products as mapping
      on mapping.id = requirement.solution_product_id
    where requirement.solution_option_id = new.id
      and mapping.solution_id <> new.solution_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'Solution Option must match all mapped Product Requirements';
  end if;

  return new;
end;
$$;

create trigger solution_options_requirement_match
before update of solution_id
on public.solution_options
for each row
when (old.solution_id is distinct from new.solution_id)
execute function public.enforce_solution_option_requirement_match();

create function public.enforce_solution_product_option_match()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.product_requirements as requirement
    join public.solution_options as solution_option
      on solution_option.id = requirement.solution_option_id
    where requirement.solution_product_id = new.id
      and solution_option.solution_id <> new.solution_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'Solution Product mapping must match all linked Solution Options';
  end if;

  return new;
end;
$$;

create trigger solution_products_option_match
before update of solution_id
on public.solution_products
for each row
when (old.solution_id is distinct from new.solution_id)
execute function public.enforce_solution_product_option_match();

revoke execute on function public.enforce_option_requirement_solution_match()
  from public, anon, authenticated;
revoke execute on function public.enforce_solution_option_requirement_match()
  from public, anon, authenticated;
revoke execute on function public.enforce_solution_product_option_match()
  from public, anon, authenticated;

create function public.select_work_package_solution(
  p_work_package_id uuid,
  p_solution_option_id uuid,
  p_expected_current_option_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_option_id uuid;
begin
  if auth.uid() is null then
    raise exception using
      errcode = '42501',
      message = 'Authentication required';
  end if;

  if p_work_package_id is null
    or p_solution_option_id is null
    or p_expected_current_option_id is null then
    raise exception using
      errcode = '22023',
      message = 'Work Package, Solution Option, and expected selection are required';
  end if;

  select selected_solution_option_id
  into current_option_id
  from public.work_packages
  where id = p_work_package_id
  for update;

  if not found then
    raise exception using
      errcode = '22023',
      message = 'Work Package not found';
  end if;

  if not exists (
    select 1
    from public.solution_options
    where id = p_solution_option_id
      and work_package_id = p_work_package_id
  ) then
    raise exception using
      errcode = '22023',
      message = 'Solution Option does not belong to the Work Package';
  end if;

  if current_option_id = p_solution_option_id then
    return current_option_id;
  end if;

  if current_option_id <> p_expected_current_option_id then
    raise exception using
      errcode = '40001',
      message = 'Selected Solution changed; reload current evidence';
  end if;

  update public.work_packages
  set selected_solution_option_id = p_solution_option_id
  where id = p_work_package_id;

  return p_solution_option_id;
end;
$$;

revoke all on function public.select_work_package_solution(uuid, uuid, uuid)
  from public, anon;
grant execute on function public.select_work_package_solution(uuid, uuid, uuid)
  to authenticated;

alter table public.solution_options enable row level security;

drop policy "anon reads Solutions" on public.solutions;
drop policy "anon reads Work Packages" on public.work_packages;
drop policy "anon reads Products" on public.products;
drop policy "anon reads Solution Products" on public.solution_products;
drop policy "anon reads Product Requirements" on public.product_requirements;
drop policy "anon reads Inventory Snapshots" on public.inventory_snapshots;

create policy "runtime reads Solutions"
  on public.solutions for select to anon, authenticated using (true);
create policy "runtime reads Work Packages"
  on public.work_packages for select to anon, authenticated using (true);
create policy "runtime reads Products"
  on public.products for select to anon, authenticated using (true);
create policy "runtime reads Solution Products"
  on public.solution_products for select to anon, authenticated using (true);
create policy "runtime reads Product Requirements"
  on public.product_requirements for select to anon, authenticated using (true);
create policy "runtime reads Inventory Snapshots"
  on public.inventory_snapshots for select to anon, authenticated using (true);
create policy "runtime reads Solution Options"
  on public.solution_options for select to anon, authenticated using (true);

revoke all on table public.solutions from authenticated;
revoke all on table public.work_packages from authenticated;
revoke all on table public.products from authenticated;
revoke all on table public.solution_products from authenticated;
revoke all on table public.product_requirements from authenticated;
revoke all on table public.inventory_snapshots from authenticated;
revoke all on table public.solution_options from anon, authenticated;

grant usage on schema public to authenticated;
grant select on table public.solutions to authenticated;
grant select on table public.work_packages to authenticated;
grant select on table public.products to authenticated;
grant select on table public.solution_products to authenticated;
grant select on table public.product_requirements to authenticated;
grant select on table public.inventory_snapshots to authenticated;
grant select on table public.solution_options to anon, authenticated;
