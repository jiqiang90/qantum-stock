begin;

select plan(21);

select has_table(
  'public',
  'solution_options',
  'Solution Options are persisted independently from catalogue Solutions'
);
select has_column(
  'public',
  'work_packages',
  'selected_solution_option_id',
  'Work Packages identify their selected Solution Option'
);
select hasnt_column(
  'public',
  'work_packages',
  'solution_id',
  'Work Packages no longer own a fixed Solution directly'
);
select has_column(
  'public',
  'product_requirements',
  'solution_option_id',
  'Product Requirements belong to one Solution Option'
);
select hasnt_column(
  'public',
  'product_requirements',
  'work_package_id',
  'Product Requirements do not duplicate Work Package ownership'
);

select is(
  (
    select count(*)
    from public.work_packages as work_package
    where (
      select count(*)
      from public.solution_options as solution_option
      where solution_option.work_package_id = work_package.id
    ) < 2
  ),
  0::bigint,
  'every Work Package has at least two eligible Solution Options'
);
select is(
  (
    select count(*)
    from public.work_packages as work_package
    left join public.solution_options as solution_option
      on solution_option.id = work_package.selected_solution_option_id
      and solution_option.work_package_id = work_package.id
    where solution_option.id is null
  ),
  0::bigint,
  'every selected option belongs to its Work Package'
);
select is(
  (
    select count(*)
    from public.product_requirements as requirement
    join public.solution_options as solution_option
      on solution_option.id = requirement.solution_option_id
    join public.solution_products as mapping
      on mapping.id = requirement.solution_product_id
    where mapping.solution_id <> solution_option.solution_id
  ),
  0::bigint,
  'every mapped requirement belongs to its option Solution'
);

select throws_ok(
  $$
    insert into public.product_requirements (
      id,
      solution_option_id,
      position,
      description,
      solution_product_id,
      required_quantity
    ) values (
      '4fffffff-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000001',
      99,
      'Duplicate mapped Product demand',
      '60000000-0000-0000-0000-000000000001',
      1
    )
  $$,
  '23505',
  'duplicate key value violates unique constraint "product_requirements_option_product_unique"',
  'one Solution Option cannot repeat the same mapped Product'
);

select lives_ok(
  $$
    insert into public.product_requirements (
      id,
      solution_option_id,
      position,
      description,
      solution_product_id,
      required_quantity
    ) values
      (
        '4fffffff-0000-0000-0000-000000000002',
        '70000000-0000-0000-0000-000000000001',
        97,
        'First unresolved Product demand',
        null,
        null
      ),
      (
        '4fffffff-0000-0000-0000-000000000003',
        '70000000-0000-0000-0000-000000000001',
        98,
        'Second unresolved Product demand',
        null,
        null
      )
  $$,
  'one Solution Option may retain multiple unresolved Product needs'
);

select ok(
  has_table_privilege('anon', 'public.solution_options', 'SELECT'),
  'anonymous visitors can read Solution Options'
);
select ok(
  has_table_privilege('authenticated', 'public.solution_options', 'SELECT'),
  'authenticated visitors retain Solution Option read access'
);
select ok(
  not has_table_privilege('anon', 'public.work_packages', 'UPDATE'),
  'anonymous visitors cannot update Work Packages directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.work_packages', 'UPDATE'),
  'authenticated visitors cannot update Work Packages directly'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.select_work_package_solution(uuid, uuid, uuid)',
    'EXECUTE'
  ),
  'anonymous visitors cannot execute the selection command'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.select_work_package_solution(uuid, uuid, uuid)',
    'EXECUTE'
  ),
  'authenticated visitors can execute only the selection command'
);

set local role authenticated;

select throws_ok(
  $$
    select public.select_work_package_solution(
      '20000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000002',
      '70000000-0000-0000-0000-000000000001'
    )
  $$,
  '42501',
  'Authentication required',
  'an authenticated database role without a verified user cannot select'
);

set local "request.jwt.claims" =
  '{"sub":"90000000-0000-0000-0000-000000000001","role":"authenticated"}';

select throws_ok(
  $$
    select public.select_work_package_solution(
      '20000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000004',
      '70000000-0000-0000-0000-000000000001'
    )
  $$,
  '22023',
  'Solution Option does not belong to the Work Package',
  'an unrelated Solution Option is rejected'
);

select is(
  public.select_work_package_solution(
    '20000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000002',
    '70000000-0000-0000-0000-000000000001'
  ),
  '70000000-0000-0000-0000-000000000002'::uuid,
  'an authenticated visitor can select an eligible option'
);
select is(
  public.select_work_package_solution(
    '20000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000002',
    '70000000-0000-0000-0000-000000000001'
  ),
  '70000000-0000-0000-0000-000000000002'::uuid,
  'repeating the committed selection is idempotent'
);
select throws_ok(
  $$
    select public.select_work_package_solution(
      '20000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000001'
    )
  $$,
  '40001',
  'Selected Solution changed; reload current evidence',
  'a stale expected selection cannot overwrite a newer choice'
);

select * from finish();
rollback;
