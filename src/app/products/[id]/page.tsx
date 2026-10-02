import { notFound } from "next/navigation";

import { createProductService } from "@/modules/product/create-product-service";
import {
  parseProductDetailTab,
  parseProductId,
} from "@/modules/product/product-boundaries";
import { ProductDetail } from "@/modules/product/product-detail";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id: routeId }, query] = await Promise.all([params, searchParams]);
  const id = parseProductId(routeId);
  const activeTab = parseProductDetailTab(query.tab);

  if (id === null) {
    notFound();
  }

  const products = createProductService();
  const product = await products.findById(id);

  if (product === null) {
    notFound();
  }

  return (
    <article>
      <ProductDetail activeTab={activeTab} product={product} />
    </article>
  );
}
