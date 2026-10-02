import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseSupabaseReadConfig } from "./readiness-boundaries";
import { ReadinessService } from "./readiness-service";
import { SupabaseReadinessRepository } from "./supabase-readiness-repository";

export function createReadinessService(): ReadinessService {
  const config = parseSupabaseReadConfig(process.env);
  const client = createClient<Database>(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  const repository = new SupabaseReadinessRepository(client);

  return new ReadinessService(repository);
}

export async function createAuthenticatedReadinessService(): Promise<ReadinessService> {
  const client = await createSupabaseServerClient();
  return new ReadinessService(new SupabaseReadinessRepository(client));
}
