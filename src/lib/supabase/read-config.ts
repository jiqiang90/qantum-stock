import { z } from "zod";

const supabaseReadConfigSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
});

export interface SupabaseReadConfig {
  readonly url: string;
  readonly publishableKey: string;
}

export function parseSupabaseReadConfig(
  environment: Record<string, string | undefined>,
): SupabaseReadConfig {
  const result = supabaseReadConfigSchema.safeParse(environment);

  if (!result.success) {
    throw new Error("Material readiness data is not configured.");
  }

  return {
    url: result.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
