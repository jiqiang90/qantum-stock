import { PageHeading } from "@/components/page-heading";
import { createProductService } from "@/modules/product/create-product-service";
import { parseProductListFilters } from "@/modules/product/product-boundaries";
import { ProductList } from "@/modules/product/product-list";
import { ProductListControls } from "@/modules/product/product-list-controls";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseProductListFilters(await searchParams);
  const products = createProductService();
  const items = await products.list(filters);

  return (
    <div>
      <PageHeading
        eyebrow="Product catalogue"
        title="Products"
        description="Search Product identity, Inventory evidence, and Work Package usage."
      />
      <ProductListControls filters={filters} />
      <ProductList filters={filters} items={items} />
    </div>
  );
}
