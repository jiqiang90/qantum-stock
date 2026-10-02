begin;

select plan(56);

select has_table('public', 'solutions', 'solutions table exists');
select has_table('public', 'work_packages', 'work_packages table exists');
select has_table('public', 'products', 'products table exists');
select has_table(
  'public',
  'solution_products',
  'solution_products association table exists'
);
select has_table(
  'public',
  'product_requirements',
  'product_requirements table exists'
);
select has_table(
  'public',
  'inventory_snapshots',
  'inventory_snapshots table exists'
);
select hasnt_table(
  'public',
  'product_categories',
  'the slice does not introduce a Product Category hierarchy table'
);

select hasnt_column(
  'public',
  'solutions',
  'name',
  'Solutions do not persist an invented display name'
);
select col_not_null(
  'public',
  'solutions',
  'internal_code',
  'Solution Internal Code is required'
);
select col_not_null(
  'public',
  'solutions',
  'supplier_ref_code',
  'Solution Supplier Ref. Code is required'
);
select col_not_null('public', 'solutions', 'supplier', 'Solution supplier is required');
select col_not_null(
  'public',
  'solutions',
  'orientation',
  'Solution orientation is required'
);
select col_not_null(
  'public',
  'solutions',
  'substrate',
  'Solution raw substrate is required'
);
select col_not_null(
  'public',
  'solutions',
  'service_classification',
  'Solution service classification is required'
);
select col_not_null(
  'public',
  'solutions',
  'service_type',
  'Solution raw service type is required'
);
select col_not_null(
  'public',
  'solutions',
  'service_size',
  'Solution service size is required'
);
select col_not_null(
  'public',
  'solutions',
  'integrity',
  'Solution integrity is required'
);
select col_not_null(
  'public',
  'solutions',
  'insulation',
  'Solution insulation is required'
);
select col_not_null(
  'public',
  'solutions',
  'service_type_option',
  'Solution service type option is required'
);
select col_not_null(
  'public',
  'solutions',
  'substrate_option',
  'Solution substrate option is required'
);
select is(
  (
    select count(*)
    from pg_constraint
    where conrelid = 'public.solutions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%btrim(%'
  ),
  12::bigint,
  'every supplied Solution text field rejects blank values'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.solutions'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) = 'UNIQUE (supplier, internal_code)'
  ),
  'Solution Internal Code is unique within a supplier'
);

select col_is_unique(
  'public',
  'products',
  'product_code',
  'Product Code is unique'
);
select col_not_null(
  'public',
  'products',
  'product_code',
  'Product Code is required'
);
select col_not_null('public', 'products', 'name', 'Product name is required');
select col_not_null(
  'public',
  'products',
  'canonical_unit',
  'canonical unit is required'
);
select has_column(
  'public',
  'products',
  'category',
  'Product category exists'
);
select col_not_null(
  'public',
  'products',
  'category',
  'Product category is required'
);
select has_column(
  'public',
  'products',
  'manufacturer',
  'Product manufacturer exists'
);
select col_not_null(
  'public',
  'products',
  'manufacturer',
  'Product manufacturer is required'
);
select has_column(
  'public',
  'products',
  'supplier_product_code',
  'Supplier Product Code exists'
);
select col_not_null(
  'public',
  'products',
  'supplier_product_code',
  'Supplier Product Code is required'
);
select has_column(
  'public',
  'products',
  'variant',
  'Product variant exists'
);
select col_not_null(
  'public',
  'products',
  'variant',
  'Product variant is required'
);
select has_column(
  'public',
  'products',
  'description',
  'Product description exists'
);
select col_not_null(
  'public',
  'products',
  'description',
  'Product description is required'
);
select col_not_null(
  'public',
  'solution_products',
  'solution_id',
  'a Solution mapping requires a Solution'
);
select col_not_null(
  'public',
  'solution_products',
  'product_id',
  'a Solution mapping requires a Product'
);
select has_column(
  'public',
  'product_requirements',
  'solution_product_id',
  'Product Requirements can reference a Solution-Product association'
);
select col_is_null(
  'public',
  'product_requirements',
  'solution_product_id',
  'an unresolved Product mapping remains nullable'
);
select hasnt_column(
  'public',
  'product_requirements',
  'product_id',
  'Product Requirements do not bypass the nominated Solution mapping'
);
select col_is_null(
  'public',
  'product_requirements',
  'required_quantity',
  'an unknown required quantity remains nullable'
);
select col_type_is(
  'public',
  'product_requirements',
  'required_quantity',
  'numeric(12,3)',
  'required quantity uses the domain scale'
);
select col_type_is(
  'public',
  'inventory_snapshots',
  'available_quantity',
  'numeric(12,3)',
  'available quantity uses the domain scale'
);
select col_not_null(
  'public',
  'inventory_snapshots',
  'available_quantity',
  'snapshot quantity is known when a snapshot exists'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.product_requirements'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%required_quantity >=%'
  ),
  'required quantities cannot be negative'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.inventory_snapshots'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%available_quantity >=%'
  ),
  'available quantities cannot be negative'
);
select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'inventory_snapshots'
      and indexdef like '%(product_id, captured_at DESC, id DESC)%'
  ),
  'latest snapshot lookup has a deterministic supporting index'
);
select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'solution_products'
      and indexdef like '%(product_id)%'
  ),
  'Product Explorer can traverse Solution mappings by Product'
);
select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'product_requirements'
      and indexdef like '%(solution_product_id)%'
  ),
  'Product Explorer can traverse Requirements by Solution mapping'
);

select throws_ok(
  $$
    insert into public.product_requirements (
      id,
      work_package_id,
      position,
      description,
      solution_product_id,
      required_quantity
    ) values (
      '40000000-0000-0000-0000-000000000097',
      '20000000-0000-0000-0000-000000000001',
      97,
      'Reject a Product mapping from another Solution',
      '60000000-0000-0000-0000-000000000004',
      1
    )
  $$,
  '23514',
  'Product Requirement mapping must belong to the Work Package Solution',
  'a Product Requirement cannot use a mapping from another Solution'
);
select throws_ok(
  $$
    update public.work_packages
    set solution_id = '10000000-0000-0000-0000-000000000002'
    where id = '20000000-0000-0000-0000-000000000001'
  $$,
  '23514',
  'Work Package Solution must match all mapped Product Requirements',
  'a Work Package cannot change to a Solution that conflicts with its Requirements'
);
select throws_ok(
  $$
    update public.solution_products
    set solution_id = '10000000-0000-0000-0000-000000000002'
    where id = '60000000-0000-0000-0000-000000000001'
  $$,
  '23514',
  'Solution Product mapping must match all linked Work Packages',
  'a Solution Product cannot move while linked Requirements use another Solution'
);

select lives_ok(
  $$
    insert into public.product_requirements (
      id,
      work_package_id,
      position,
      description,
      solution_product_id,
      required_quantity
    ) values (
      '40000000-0000-0000-0000-000000000099',
      '20000000-0000-0000-0000-000000000001',
      99,
      'Verify zero required quantity remains known',
      '60000000-0000-0000-0000-000000000001',
      0
    )
  $$,
  'zero is a valid required quantity'
);
select throws_ok(
  $$
    insert into public.product_requirements (
      id,
      work_package_id,
      position,
      description,
      solution_product_id,
      required_quantity
    ) values (
      '40000000-0000-0000-0000-000000000098',
      '20000000-0000-0000-0000-000000000001',
      98,
      'Quantity without a Product-owned unit is invalid',
      null,
      10
    )
  $$,
  '23514',
  'new row for relation "product_requirements" violates check constraint "product_requirements_unmapped_quantity_unknown"',
  'an unmapped requirement cannot store a unitless quantity'
);
select lives_ok(
  $$
    insert into public.inventory_snapshots (
      id,
      product_id,
      available_quantity,
      captured_at
    ) values (
      '50000000-0000-0000-0000-000000000099',
      '30000000-0000-0000-0000-000000000001',
      0,
      '2026-10-01T19:00:00Z'
    )
  $$,
  'zero is a valid available quantity'
);

select * from finish();
rollback;
