alter table public.product_requirements
  add column product_id uuid references public.products (id);

update public.product_requirements as requirement
set product_id = mapping.product_id
from public.solution_products as mapping
where mapping.id = requirement.solution_product_id;

drop trigger option_requirements_solution_match
  on public.product_requirements;
drop trigger solution_options_requirement_match
  on public.solution_options;
drop trigger solution_products_option_match
  on public.solution_products;

drop function public.enforce_option_requirement_solution_match();
drop function public.enforce_solution_option_requirement_match();
drop function public.enforce_solution_product_option_match();

alter table public.product_requirements
  drop constraint product_requirements_option_product_unique,
  drop constraint product_requirements_unmapped_quantity_unknown;

drop index public.product_requirements_solution_product_id_idx;

alter table public.product_requirements
  drop column solution_product_id,
  add constraint product_requirements_unmapped_quantity_unknown
    check (product_id is not null or required_quantity is null),
  add constraint product_requirements_option_product_unique
    unique (solution_option_id, product_id);

create index product_requirements_product_id_idx
  on public.product_requirements (product_id);

drop table public.solution_products;
