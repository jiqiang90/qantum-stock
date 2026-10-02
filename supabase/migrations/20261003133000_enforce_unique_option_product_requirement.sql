alter table public.product_requirements
  add constraint product_requirements_option_product_unique
  unique (solution_option_id, solution_product_id);
