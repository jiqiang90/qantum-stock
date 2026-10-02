begin;

select plan(23);

select is(
  (select count(*) from public.solutions),
  12::bigint,
  'seed contains twelve source-backed Solutions'
);

select results_eq(
  $$
    select
      internal_code,
      supplier_ref_code,
      supplier,
      orientation,
      substrate,
      service_classification,
      service_type,
      service_size,
      integrity,
      insulation,
      service_type_option,
      substrate_option
    from public.solutions
    order by internal_code
  $$,
  $$
    values
      ('0334'::text, 'V1.11-22SFR00038-146-E'::text, 'Ryanfire'::text, 'Wall'::text, 'FR plasterboard, FR plasterboard wall (1 layer 13mm)'::text, 'Non-Combustible Pipe'::text, 'Copper Pipe'::text, 'Ø100mm'::text, '60'::text, '-'::text, 'Copper Pipe'::text, 'Plasterboard Wall'::text),
      ('0375', 'V15.1-21SFR00018-130-D', 'Ryanfire', 'Wall', 'FR plasterboard, FR plasterboard wall (2 layers 13mm)', 'Insulated Pipe', 'Copper Pipe  - 50mm Fibreglass', 'Ø32mm', '60', '60', 'Insulated Copper Pipe', 'Plasterboard Wall'),
      ('0444', 'V21.2-21SFR00051-98-A', 'Ryanfire', 'Wall', 'FR plasterboard, FR plasterboard wall (1 layer 13mm)', 'Combustible Pipe', 'PVC Pipe', 'Ø40mm', '60', '60', 'PVC Pipe', 'Plasterboard Wall'),
      ('0455', 'V21.30-22SFR00073-184-B', 'Ryanfire', 'Wall', 'KOROK®, KOROK® wall (78mm)', 'Combustible Pipe', 'PVC Pipe', 'Ø65mm', '120', '120', 'PVC Pipe', 'Korok Wall'),
      ('0470', 'V21.42-23SFR00089-280-I', 'Ryanfire', 'Wall', 'AFS Logicwall®, AFS Logicwall®', 'Combustible Pipe', 'PVC Pipe', 'Ø65mm', '120', '120', 'PVC Pipe', 'AFS Logic Wall'),
      ('0485', 'V22.11-PF 19060-74-B', 'Ryanfire', 'Floor', 'Timber Infill, 100mm timber infill floor', 'Combustible Pipe', 'PVC Pipe', 'Ø50mm', '90', '90', 'PVC Pipe', 'Timber Infill Floor'),
      ('0510', 'V22.35-22SFR00072-181-C', 'Ryanfire', 'Ceiling', 'FR plasterboard, FR plasterboard ceiling (1 layer 16mm)', 'Electrical Penetration', 'PVC Conduit', 'Ø25mm', '60', '60', 'PVC Conduit', 'Plasterboard Ceiling'),
      ('0512', 'V22.36-23SFR00075-234-G', 'Ryanfire', 'Floor', 'CLT, 103mm CLT floor', 'Combustible Pipe', 'PVC Pipe', 'Ø80mm', '60', '60', 'PVC Pipe', 'CLT Floor'),
      ('0521', 'V22.44-22SFR00074-171-C', 'Ryanfire', 'Floor', 'Concrete, 125mm concrete floor', 'Combustible Pipe', 'PVC Pipe', 'Ø100mm', '60', '60', 'PVC Pipe', 'Concrete Floor'),
      ('0659', 'V27.8-PF 19010-62-15', 'Ryanfire', 'Wall', 'FR plasterboard, FR plasterboard wall (1 layer 13mm)', 'Electrical Penetration', 'Cable Tray D1', '300mm', '60', '60', 'Cable Tray', 'Plasterboard Wall'),
      ('0677', 'V29.24-21SFR00057-105-A', 'Ryanfire', 'Ceiling', 'FR plasterboard, FR plasterboard ceiling (1 layer 16mm)', 'Electrical Penetration', 'Cable Bundle TPS', 'Ø100mm', '60', '60', 'Cable (Single or Bundle)', 'Plasterboard Ceiling'),
      ('0918', 'V64.20-23SFR00097-266-B', 'Ryanfire', 'Wall', 'FR plasterboard, 190mm Glulam timber beam (1 layer 19mm)', 'Structural Penetration', 'Timber Beam', '190mm', '120', '120', 'Timber Beam', 'Plasterboard Wall')
  $$,
  'seed preserves the selected catalogue rows field for field'
);

select is(
  (select count(*) from public.work_packages),
  6::bigint,
  'seed contains six Work Packages'
);
select is(
  (select count(*) from public.products),
  5::bigint,
  'seed contains five specific synthetic Products'
);
select is(
  (select count(*) from public.solution_products),
  9::bigint,
  'seed contains nine Solution-to-Product mappings'
);
select is(
  (select count(*) from public.product_requirements),
  15::bigint,
  'seed contains fifteen Product Requirements'
);
select is(
  (select count(*) from public.inventory_snapshots),
  5::bigint,
  'seed contains five deterministic Inventory Snapshots'
);
select is(
  (
    select count(*)
    from public.work_packages
    where solution_id is not null
  ),
  6::bigint,
  'every Work Package nominates one Solution'
);
select is(
  (
    select count(*)
    from (
      select name
      from public.work_packages
      where name like 'DEMO-%'
      union all
      select name
      from public.products
      where name like 'DEMO-%'
      union all
      select product_code
      from public.products
      where product_code like 'DEMO-%'
    ) as repeated_demo_identity
  ),
  0::bigint,
  'record identities stay concise without a repeated DEMO prefix'
);
select is(
  (
    select count(distinct solution_id)
    from public.solution_products
  ),
  4::bigint,
  'four source-backed Solutions have synthetic Product mappings'
);
select is(
  (
    select count(*)
    from (
      select solution_id
      from public.work_packages
      group by solution_id
      having count(*) > 1
    ) as reused_solution
  ),
  2::bigint,
  'two Solutions are reused by multiple Work Packages'
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
      or btrim(category) = ''
      or btrim(manufacturer) = ''
      or btrim(supplier_product_code) = ''
      or btrim(variant) = ''
      or btrim(description) = ''
      or btrim(canonical_unit) = ''
  ),
  0::bigint,
  'every Product has its required identity and profile fields'
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
    from public.solutions as solution
    where not exists (
      select 1
      from public.solution_products as mapping
      where mapping.solution_id = solution.id
    )
  ),
  8::bigint,
  'eight source-backed Solutions remain catalogue coverage only'
);
select is(
  (
    select count(*)
    from public.product_requirements as requirement
    join public.work_packages as work_package
      on work_package.id = requirement.work_package_id
    join public.solution_products as mapping
      on mapping.id = requirement.solution_product_id
    where mapping.solution_id <> work_package.solution_id
  ),
  0::bigint,
  'every mapped Product Requirement belongs to its nominated Solution'
);
select is(
  (
    select count(*)
    from public.product_requirements
    where solution_product_id is null
      and required_quantity is null
  ),
  1::bigint,
  'seed preserves one unresolved Product mapping'
);
select is(
  (
    select count(*)
    from public.product_requirements
    where solution_product_id is not null
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
  0::bigint,
  'every demo Work Package has at least one Product Requirement'
);
select is(
  (
    select count(*)
    from public.product_requirements as requirement
    join public.solution_products as mapping
      on mapping.id = requirement.solution_product_id
    where not exists (
        select 1
        from public.inventory_snapshots as inventory
        where inventory.product_id = mapping.product_id
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
          when mapping.product_id is null
            or requirement.required_quantity is null
            or inventory.product_id is null
            then 'UNKNOWN'
          when inventory.available_quantity < requirement.required_quantity
            then 'SHORTAGE'
          else 'READY'
        end as status
      from public.product_requirements as requirement
      left join public.solution_products as mapping
        on mapping.id = requirement.solution_product_id
      left join latest_inventory as inventory
        on inventory.product_id = mapping.product_id
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
      ('East core cable tray opening'::text, 'SHORTAGE'::text),
      ('Level 1 timber floor penetrations'::text, 'SHORTAGE'::text),
      ('Level 2 service riser firestopping'::text, 'READY'::text),
      ('Level 2 timber floor penetrations'::text, 'SHORTAGE'::text),
      ('Level 3 ceiling conduit penetrations'::text, 'UNKNOWN'::text),
      ('Level 3 east riser firestopping'::text, 'READY'::text)
  $$,
  'Work Packages cover multi-product readiness boundaries and precedence'
);

select is(
  (
    with selected_demand as (
      select
        mapping.product_id,
        sum(requirement.required_quantity) as required_quantity
      from public.product_requirements as requirement
      join public.solution_products as mapping
        on mapping.id = requirement.solution_product_id
      where requirement.work_package_id in (
        '20000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000002'
      )
      group by mapping.product_id
    ),
    latest_inventory as (
      select distinct on (product_id)
        product_id,
        available_quantity
      from public.inventory_snapshots
      order by product_id, captured_at desc, id desc
    )
    select demand.required_quantity - inventory.available_quantity
    from selected_demand as demand
    join public.products as product on product.id = demand.product_id
    join latest_inventory as inventory on inventory.product_id = demand.product_id
    where product.product_code = 'IS-310'
  ),
  2::numeric,
  'two individually ready Work Packages expose a combined sealant shortage of two cartridges'
);

select * from finish();
rollback;
