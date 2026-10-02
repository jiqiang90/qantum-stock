import type {
  ProductEvidence,
  ProductListFilters,
  ProductListItem,
} from "./product-model";
import type { ProductRepository } from "./product-repository";

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async list(filters: ProductListFilters): Promise<readonly ProductListItem[]> {
    const products = await this.repository.list();
    const query = filters.query.trim().toLocaleLowerCase("en-NZ");

    return products
      .filter((product) => matchesQuery(product, query))
      .filter((product) => matchesUsage(product, filters.usage))
      .filter((product) => matchesInventory(product, filters.inventory))
      .sort(compareProducts)
      .map(toListItem);
  }

  findById(id: string): Promise<ProductEvidence | null> {
    return this.repository.findById(id);
  }
}

function matchesQuery(product: ProductEvidence, query: string): boolean {
  if (query.length === 0) {
    return true;
  }

  return [product.productCode, product.name].some((value) =>
    value.toLocaleLowerCase("en-NZ").includes(query),
  );
}

function matchesUsage(
  product: ProductEvidence,
  usage: ProductListFilters["usage"],
): boolean {
  if (usage === "all") {
    return true;
  }

  return usage === "used"
    ? product.usages.length > 0
    : product.usages.length === 0;
}

function matchesInventory(
  product: ProductEvidence,
  inventory: ProductListFilters["inventory"],
): boolean {
  if (inventory === "all") {
    return true;
  }

  const hasEvidence = product.inventorySnapshot !== null;
  return inventory === "known" ? hasEvidence : !hasEvidence;
}

function compareProducts(
  left: ProductEvidence,
  right: ProductEvidence,
): number {
  return (
    left.productCode.localeCompare(right.productCode, "en-NZ") ||
    left.id.localeCompare(right.id, "en-NZ")
  );
}

function toListItem(product: ProductEvidence): ProductListItem {
  return {
    id: product.id,
    productCode: product.productCode,
    name: product.name,
    canonicalUnit: product.canonicalUnit,
    inventorySnapshot: product.inventorySnapshot,
    referencingWorkPackageCount: new Set(
      product.usages.map(({ workPackage }) => workPackage.id),
    ).size,
  };
}
