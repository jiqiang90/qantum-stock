import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { parseSupabaseReadConfig } from "@/lib/supabase/read-config";
import { ProductService } from "./product-service";
import { SupabaseProductRepository } from "./supabase-product-repository";

export function createProductService(): ProductService {
  const config = parseSupabaseReadConfig(process.env);
  const client = createClient<Database>(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return new ProductService(new SupabaseProductRepository(client));
}
