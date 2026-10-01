begin;

select plan(4);

select ok(
  (
    select bool_and(has_table_privilege('anon', table_name, 'SELECT'))
    from unnest(
      array[
        'public.solutions',
        'public.work_packages',
        'public.products',
        'public.product_requirements',
        'public.inventory_snapshots'
      ]
    ) as exposed_tables(table_name)
  ),
  'anon can select all tables required by the demo'
);

select ok(
  not (
    select bool_or(
      has_table_privilege(
        'anon',
        table_name,
        'INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'
      )
    )
    from unnest(
      array[
        'public.solutions',
        'public.work_packages',
        'public.products',
        'public.product_requirements',
        'public.inventory_snapshots'
      ]
    ) as exposed_tables(table_name)
  ),
  'anon has no mutation privileges on demo tables'
);

select results_eq(
  $$
    select relname
    from pg_class
    where relnamespace = 'public'::regnamespace
      and relname in (
        'solutions',
        'work_packages',
        'products',
        'product_requirements',
        'inventory_snapshots'
      )
      and relrowsecurity
    order by relname
  $$,
  $$
    values
      ('inventory_snapshots'::name),
      ('product_requirements'::name),
      ('products'::name),
      ('solutions'::name),
      ('work_packages'::name)
  $$,
  'row-level security is enabled on every exposed table'
);

set local role anon;
select ok(
  exists (select 1 from public.work_packages),
  'anon can read the Sample Work Packages through RLS'
);
reset role;

select * from finish();
rollback;
