create table public.solutions (
  id uuid primary key,
  name text not null,
  constraint solutions_name_not_blank
    check (btrim(name) <> '')
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
  canonical_unit text not null,
  constraint products_code_not_blank
    check (btrim(product_code) <> ''),
  constraint products_name_not_blank
    check (btrim(name) <> ''),
  constraint products_canonical_unit_not_blank
    check (btrim(canonical_unit) <> '')
);

create table public.product_requirements (
  id uuid primary key,
  work_package_id uuid not null
    references public.work_packages (id) on delete cascade,
  position integer not null,
  description text not null,
  product_id uuid references public.products (id),
  required_quantity numeric(12,3),
  constraint product_requirements_position_nonnegative
    check (position >= 0),
  constraint product_requirements_description_not_blank
    check (btrim(description) <> ''),
  constraint product_requirements_quantity_nonnegative
    check (required_quantity >= 0),
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

create index inventory_snapshots_latest_product_idx
  on public.inventory_snapshots (product_id, captured_at desc, id desc);

alter table public.solutions enable row level security;
alter table public.work_packages enable row level security;
alter table public.products enable row level security;
alter table public.product_requirements enable row level security;
alter table public.inventory_snapshots enable row level security;

create policy "anon reads Sample Solutions"
  on public.solutions
  for select
  to anon
  using (true);

create policy "anon reads Sample Work Packages"
  on public.work_packages
  for select
  to anon
  using (true);

create policy "anon reads Sample Products"
  on public.products
  for select
  to anon
  using (true);

create policy "anon reads Sample Product Requirements"
  on public.product_requirements
  for select
  to anon
  using (true);

create policy "anon reads Sample Inventory Snapshots"
  on public.inventory_snapshots
  for select
  to anon
  using (true);

revoke all on table public.solutions from anon;
revoke all on table public.work_packages from anon;
revoke all on table public.products from anon;
revoke all on table public.product_requirements from anon;
revoke all on table public.inventory_snapshots from anon;

grant usage on schema public to anon;
grant select on table public.solutions to anon;
grant select on table public.work_packages to anon;
grant select on table public.products to anon;
grant select on table public.product_requirements to anon;
grant select on table public.inventory_snapshots to anon;
