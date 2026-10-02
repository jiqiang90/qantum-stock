create table public.solutions (
  id uuid primary key,
  internal_code text not null,
  supplier_ref_code text not null,
  supplier text not null,
  orientation text not null,
  substrate text not null,
  service_classification text not null,
  service_type text not null,
  service_size text not null,
  integrity text not null,
  insulation text not null,
  service_type_option text not null,
  substrate_option text not null,
  constraint solutions_internal_code_not_blank
    check (btrim(internal_code) <> ''),
  constraint solutions_supplier_ref_code_not_blank
    check (btrim(supplier_ref_code) <> ''),
  constraint solutions_supplier_not_blank
    check (btrim(supplier) <> ''),
  constraint solutions_orientation_not_blank
    check (btrim(orientation) <> ''),
  constraint solutions_substrate_not_blank
    check (btrim(substrate) <> ''),
  constraint solutions_service_classification_not_blank
    check (btrim(service_classification) <> ''),
  constraint solutions_service_type_not_blank
    check (btrim(service_type) <> ''),
  constraint solutions_service_size_not_blank
    check (btrim(service_size) <> ''),
  constraint solutions_integrity_not_blank
    check (btrim(integrity) <> ''),
  constraint solutions_insulation_not_blank
    check (btrim(insulation) <> ''),
  constraint solutions_service_type_option_not_blank
    check (btrim(service_type_option) <> ''),
  constraint solutions_substrate_option_not_blank
    check (btrim(substrate_option) <> ''),
  constraint solutions_supplier_internal_code_unique
    unique (supplier, internal_code)
);

create table public.work_packages (
  id uuid primary key,
  name text not null,
  planned_date date not null,
  solution_id uuid not null references public.solutions (id),
  constraint work_packages_name_not_blank
    check (btrim(name) <> '')
);

create table public.products (
  id uuid primary key,
  product_code text not null unique,
  name text not null,
  category text not null,
  manufacturer text not null,
  supplier_product_code text not null,
  variant text not null,
  description text not null,
  canonical_unit text not null,
  constraint products_code_not_blank
    check (btrim(product_code) <> ''),
  constraint products_name_not_blank
    check (btrim(name) <> ''),
  constraint products_category_not_blank
    check (btrim(category) <> ''),
  constraint products_manufacturer_not_blank
    check (btrim(manufacturer) <> ''),
  constraint products_supplier_product_code_not_blank
    check (btrim(supplier_product_code) <> ''),
  constraint products_variant_not_blank
    check (btrim(variant) <> ''),
  constraint products_description_not_blank
    check (btrim(description) <> ''),
  constraint products_canonical_unit_not_blank
    check (btrim(canonical_unit) <> ''),
  constraint products_supplier_identity_unique
    unique (manufacturer, supplier_product_code)
);

create table public.solution_products (
  id uuid primary key,
  solution_id uuid not null
    references public.solutions (id) on delete cascade,
  product_id uuid not null references public.products (id),
  constraint solution_products_product_unique
    unique (solution_id, product_id)
);

create table public.product_requirements (
  id uuid primary key,
  work_package_id uuid not null
    references public.work_packages (id) on delete cascade,
  position integer not null,
  description text not null,
  solution_product_id uuid references public.solution_products (id),
  required_quantity numeric(12,3),
  constraint product_requirements_position_nonnegative
    check (position >= 0),
  constraint product_requirements_description_not_blank
    check (btrim(description) <> ''),
  constraint product_requirements_quantity_nonnegative
    check (required_quantity >= 0),
  constraint product_requirements_unmapped_quantity_unknown
    check (solution_product_id is not null or required_quantity is null),
  constraint product_requirements_position_unique
    unique (work_package_id, position)
);

create table public.inventory_snapshots (
  id uuid primary key,
  product_id uuid not null references public.products (id),
  available_quantity numeric(12,3) not null,
  captured_at timestamptz not null,
  constraint inventory_snapshots_quantity_nonnegative
    check (available_quantity >= 0)
);

create index solution_products_product_id_idx
  on public.solution_products (product_id);

create index product_requirements_solution_product_id_idx
  on public.product_requirements (solution_product_id);

create index inventory_snapshots_latest_product_idx
  on public.inventory_snapshots (product_id, captured_at desc, id desc);

create function public.enforce_product_requirement_solution_match()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.solution_product_id is not null and not exists (
    select 1
    from public.work_packages as work_package
    join public.solution_products as mapping
      on mapping.id = new.solution_product_id
    where work_package.id = new.work_package_id
      and work_package.solution_id = mapping.solution_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'Product Requirement mapping must belong to the Work Package Solution';
  end if;

  return new;
end;
$$;

create trigger product_requirements_solution_match
before insert or update of work_package_id, solution_product_id
on public.product_requirements
for each row
execute function public.enforce_product_requirement_solution_match();

create function public.enforce_work_package_solution_match()
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
    where requirement.work_package_id = new.id
      and mapping.solution_id <> new.solution_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'Work Package Solution must match all mapped Product Requirements';
  end if;

  return new;
end;
$$;

create trigger work_packages_solution_match
before update of solution_id
on public.work_packages
for each row
when (old.solution_id is distinct from new.solution_id)
execute function public.enforce_work_package_solution_match();

create function public.enforce_solution_product_work_package_match()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.product_requirements as requirement
    join public.work_packages as work_package
      on work_package.id = requirement.work_package_id
    where requirement.solution_product_id = new.id
      and work_package.solution_id <> new.solution_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'Solution Product mapping must match all linked Work Packages';
  end if;

  return new;
end;
$$;

create trigger solution_products_work_package_match
before update of solution_id
on public.solution_products
for each row
when (old.solution_id is distinct from new.solution_id)
execute function public.enforce_solution_product_work_package_match();

revoke execute on function public.enforce_product_requirement_solution_match()
  from public, anon, authenticated;
revoke execute on function public.enforce_work_package_solution_match()
  from public, anon, authenticated;
revoke execute on function public.enforce_solution_product_work_package_match()
  from public, anon, authenticated;

alter table public.solutions enable row level security;
alter table public.work_packages enable row level security;
alter table public.products enable row level security;
alter table public.solution_products enable row level security;
alter table public.product_requirements enable row level security;
alter table public.inventory_snapshots enable row level security;

create policy "anon reads Solutions"
  on public.solutions
  for select
  to anon
  using (true);

create policy "anon reads Work Packages"
  on public.work_packages
  for select
  to anon
  using (true);

create policy "anon reads Products"
  on public.products
  for select
  to anon
  using (true);

create policy "anon reads Solution Products"
  on public.solution_products
  for select
  to anon
  using (true);

create policy "anon reads Product Requirements"
  on public.product_requirements
  for select
  to anon
  using (true);

create policy "anon reads Inventory Snapshots"
  on public.inventory_snapshots
  for select
  to anon
  using (true);

revoke all on table public.solutions from anon;
revoke all on table public.work_packages from anon;
revoke all on table public.products from anon;
revoke all on table public.solution_products from anon;
revoke all on table public.product_requirements from anon;
revoke all on table public.inventory_snapshots from anon;

grant usage on schema public to anon;
grant select on table public.solutions to anon;
grant select on table public.work_packages to anon;
grant select on table public.products to anon;
grant select on table public.solution_products to anon;
grant select on table public.product_requirements to anon;
grant select on table public.inventory_snapshots to anon;
