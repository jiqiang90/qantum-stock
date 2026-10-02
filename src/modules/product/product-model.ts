export type ProductUsageFilter = "all" | "used" | "unused";
export type ProductInventoryFilter = "all" | "known" | "unknown";

export interface ProductListFilters {
  readonly query: string;
  readonly usage: ProductUsageFilter;
  readonly inventory: ProductInventoryFilter;
}

export interface ProductIdentity {
  readonly id: string;
  readonly productCode: string;
  readonly name: string;
  /** Product-owned unit used to interpret quantity evidence. */
  readonly canonicalUnit: string;
}

export interface ProductProfile {
  readonly category: string;
  readonly manufacturer: string;
  readonly supplierProductCode: string;
  readonly variant: string;
  readonly description: string;
}

export interface ProductInventoryEvidence {
  readonly availableQuantity: number;
  readonly capturedAt: string;
}

export interface ProductUsageEvidence {
  readonly requirementId: string;
  readonly position: number;
  readonly description: string;
  readonly requiredQuantity: number | null;
  readonly workPackage: {
    readonly id: string;
    readonly name: string;
    readonly plannedDate: string;
  };
}

export interface ProductEvidence extends ProductIdentity, ProductProfile {
  readonly inventorySnapshot: ProductInventoryEvidence | null;
  readonly usages: readonly ProductUsageEvidence[];
}

export interface ProductListItem extends ProductIdentity {
  readonly inventorySnapshot: ProductInventoryEvidence | null;
  readonly referencingWorkPackageCount: number;
}
