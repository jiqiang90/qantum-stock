begin;

select plan(20);

select has_table('public', 'solutions', 'solutions table exists');
select has_table('public', 'work_packages', 'work_packages table exists');
select has_table('public', 'products', 'products table exists');
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
  'the slice does not introduce Product Category'
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
select col_is_null(
  'public',
  'product_requirements',
  'product_id',
  'an unresolved Product mapping remains nullable'
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

select lives_ok(
  $$
    insert into public.product_requirements (
      id,
      work_package_id,
      position,
      description,
      product_id,
      required_quantity
    ) values (
      '40000000-0000-0000-0000-000000000099',
      '20000000-0000-0000-0000-000000000001',
      1,
      'Verify zero required quantity remains known',
      '30000000-0000-0000-0000-000000000001',
      0
    )
  $$,
  'zero is a valid required quantity'
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
