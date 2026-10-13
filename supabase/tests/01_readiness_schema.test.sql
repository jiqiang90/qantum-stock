begin;

select plan(56);

select has_table('public', 'solutions', 'solutions table exists');
select has_table('public', 'work_packages', 'work_packages table exists');
select has_table('public', 'products', 'products table exists');
select hasnt_table(
  'public',
  'solution_products',
  'Product Requirements reference Products without an association table'
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
select has_column(
  'public',
  'product_requirements',
  'product_id',
  'Product Requirements can reference a Product directly'
);
select col_is_null(
  'public',
  'product_requirements',
  'product_id',
  'an unresolved Product reference remains nullable'
);
select hasnt_column(
  'public',
  'product_requirements',
  'solution_product_id',
  'Product Requirements no longer use a Solution-Product association'
);
select col_type_is(
  'public',
  'product_requirements',
  'product_id',
  'uuid',
  'Product Requirements use Product UUIDs directly'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.product_requirements'::regclass
      and confrelid = 'public.products'::regclass
      and contype = 'f'
      and conname = 'product_requirements_product_id_fkey'
  ),
  'Product Requirements enforce the direct Product reference'
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
      and tablename = 'product_requirements'
      and indexdef like '%(product_id)%'
  ),
  'Product Explorer can traverse Requirements by Product'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.product_requirements'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) = 'UNIQUE (solution_option_id, product_id)'
  ),
  'one Solution Option cannot repeat the same resolved Product'
);

select is(
  (
    select count(*)
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname in (
        'enforce_option_requirement_solution_match',
        'enforce_solution_option_requirement_match',
        'enforce_solution_product_option_match'
      )
  ),
  0::bigint,
  'obsolete Solution-Product consistency functions are removed'
);
select is(
  (
    select count(*)
    from pg_trigger
    where tgrelid in (
        'public.product_requirements'::regclass,
        'public.solution_options'::regclass
      )
      and tgname in (
        'option_requirements_solution_match',
        'solution_options_requirement_match',
        'solution_products_option_match'
      )
  ),
  0::bigint,
  'obsolete Solution-Product consistency triggers are removed'
);
select lives_ok(
  $$
    update public.solution_options
    set solution_id = '10000000-0000-0000-0000-000000000002'
    where id = '70000000-0000-0000-0000-000000000001'
  $$,
  'a Solution Option can change Solution without rewriting Product Requirements'
);

select lives_ok(
  $$
    insert into public.product_requirements (
      id,
      solution_option_id,
      position,
      description,
      product_id,
      required_quantity
    ) values (
      '40000000-0000-0000-0000-000000000099',
      '70000000-0000-0000-0000-000000000001',
      99,
      'Verify zero required quantity remains known',
      '30000000-0000-0000-0000-000000000005',
      0
    )
  $$,
  'zero is a valid required quantity'
);
select throws_ok(
  $$
    insert into public.product_requirements (
      id,
      solution_option_id,
      position,
      description,
      product_id,
      required_quantity
    ) values (
      '40000000-0000-0000-0000-000000000098',
      '70000000-0000-0000-0000-000000000001',
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
