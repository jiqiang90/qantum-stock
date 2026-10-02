import type { ProductEvidence } from "./product-model";

export interface ProductRepository {
  list(): Promise<readonly ProductEvidence[]>;
  findById(id: string): Promise<ProductEvidence | null>;
}
