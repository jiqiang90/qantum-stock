begin;

select plan(16);

select is(
  (select count(*) from public.solutions),
  9::bigint,
  'seed contains nine synthetic Solutions'
);

select is(
  (select count(*) from public.work_packages),
  9::bigint,
  'seed contains nine Sample Work Packages'
);
select is(
  (select count(*) from public.products),
  6::bigint,
  'seed contains six specific synthetic Products'
);
select is(
  (select count(*) from public.product_requirements),
  10::bigint,
  'seed contains ten Product Requirements'
);
select is(
  (select count(*) from public.inventory_snapshots),
  6::bigint,
  'seed contains six deterministic Inventory Snapshots'
);
select is(
  (
    select count(*)
    from public.work_packages
    where solution_id is not null
  ),
  9::bigint,
  'every Sample Work Package nominates one Solution'
);
select is(
  (
    select count(*)
    from public.solutions
    where name not like 'Sample %'
  ),
  0::bigint,
  'every Solution is visibly synthetic'
);
select is(
  (
    select count(*)
    from public.solutions as solution
    join public.products as product on product.id = solution.id
  ),
  0::bigint,
  'Solution identifiers are not reused as Product identifiers'
);
select is(
  (
    select count(*)
    from public.products
    where btrim(product_code) = ''
      or btrim(name) = ''
      or btrim(canonical_unit) = ''
  ),
  0::bigint,
  'every Product has its required identity fields'
);
select is(
  (
    select count(*)
    from public.products
    where name in ('Fire Collar', 'Fire Sealant', 'each', 'cartridge')
  ),
  0::bigint,
  'generic descriptions and units are not used as Product names'
);
select is(
  (
    select count(*)
    from public.product_requirements
    where product_id is null
      and required_quantity is null
  ),
  2::bigint,
  'seed preserves two unresolved Product mappings'
);
select is(
  (
    select count(*)
    from public.product_requirements
    where product_id is not null
      and required_quantity is null
  ),
  1::bigint,
  'seed preserves one missing required quantity'
);
select is(
  (
    select count(*)
    from public.work_packages as work_package
    where not exists (
      select 1
      from public.product_requirements as requirement
      where requirement.work_package_id = work_package.id
    )
  ),
  1::bigint,
  'seed preserves one Work Package with no Product Requirements'
);
select is(
  (
    select count(*)
    from public.product_requirements as requirement
    where requirement.product_id is not null
      and not exists (
        select 1
        from public.inventory_snapshots as inventory
        where inventory.product_id = requirement.product_id
      )
  ),
  1::bigint,
  'seed preserves one mapped Product without an Inventory Snapshot'
);

select results_eq(
  $$
    select id
    from public.inventory_snapshots
    where product_id = '30000000-0000-0000-0000-000000000002'
    order by captured_at desc, id desc
    limit 1
  $$,
  $$ values ('50000000-0000-0000-0000-000000000003'::uuid) $$,
  'latest Inventory Snapshot resolves captured_at ties by id descending'
);

select results_eq(
  $$
    with latest_inventory as (
      select distinct on (product_id)
        product_id,
        available_quantity
      from public.inventory_snapshots
      order by product_id, captured_at desc, id desc
    ),
    requirement_statuses as (
      select
        requirement.id as requirement_id,
        requirement.work_package_id,
        case
          when requirement.product_id is null
            or requirement.required_quantity is null
            or inventory.product_id is null
            then 'UNKNOWN'
          when inventory.available_quantity < requirement.required_quantity
            then 'SHORTAGE'
          else 'READY'
        end as status
      from public.product_requirements as requirement
      left join latest_inventory as inventory
        on inventory.product_id = requirement.product_id
    )
    select
      work_package.name,
      case
        when count(requirement.requirement_id) = 0 then 'UNKNOWN'
        when bool_or(requirement.status = 'SHORTAGE') then 'SHORTAGE'
        when bool_or(requirement.status = 'UNKNOWN') then 'UNKNOWN'
        else 'READY'
      end as status
    from public.work_packages as work_package
    left join requirement_statuses as requirement
      on requirement.work_package_id = work_package.id
    group by work_package.id, work_package.name
    order by work_package.name
  $$,
  $$
    values
      ('Sample: Cable bundle with no inventory evidence'::text, 'UNKNOWN'::text),
      ('Sample: Cable tray with shortage and unresolved item'::text, 'SHORTAGE'::text),
      ('Sample: Ceiling penetration with unmapped product'::text, 'UNKNOWN'::text),
      ('Sample: Concrete floor partial shortage'::text, 'SHORTAGE'::text),
      ('Sample: Insulated pipe with unknown demand'::text, 'UNKNOWN'::text),
      ('Sample: Structural penetration awaiting requirements'::text, 'UNKNOWN'::text),
      ('Sample: Timber floor with zero available'::text, 'SHORTAGE'::text),
      ('Sample: Wall penetration exactly supplied'::text, 'READY'::text),
      ('Sample: Wall penetration with multiple products'::text, 'READY'::text)
  $$,
  'Sample Work Packages cover readiness boundaries and precedence'
);

select * from finish();
rollback;
