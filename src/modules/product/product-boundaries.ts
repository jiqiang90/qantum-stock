import { z } from "zod";

import type { ProductListFilters } from "./product-model";

const productIdSchema = z.guid();
const querySchema = z.string().trim().min(1).max(100);
const usageSchema = z.enum(["all", "used", "unused"]);
const inventorySchema = z.enum(["all", "known", "unknown"]);
const productDetailTabSchema = z.literal("usage");

type SearchParam = string | string[] | undefined;
export type ProductDetailTab = "details" | "usage";

export function parseProductId(value: string): string | null {
  const result = productIdSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseProductListFilters(
  searchParams: Record<string, SearchParam>,
): ProductListFilters {
  return {
    query: parseOrDefault(querySchema, searchParams.q, ""),
    usage: parseOrDefault(usageSchema, searchParams.usage, "all"),
    inventory: parseOrDefault(inventorySchema, searchParams.inventory, "all"),
  };
}

export function parseProductDetailTab(value: SearchParam): ProductDetailTab {
  return parseOrDefault(productDetailTabSchema, value, "details");
}

function parseOrDefault<T>(
  schema: z.ZodType<T>,
  value: SearchParam,
  fallback: T,
): T {
  if (typeof value !== "string") {
    return fallback;
  }

  const result = schema.safeParse(value);
  return result.success ? result.data : fallback;
}
