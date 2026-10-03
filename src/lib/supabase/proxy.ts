import { createServerClient } from "@supabase/ssr";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { reportAuthFailure } from "@/lib/auth-failure";

import type { Database } from "./database.types";
import { parseSupabaseReadConfig } from "./read-config";

export async function updateSupabaseSession(request: NextRequest) {
  const config = parseSupabaseReadConfig(process.env);
  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    config.url,
    config.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.getClaims();

  if (error !== null && !isAuthSessionMissingError(error)) {
    reportAuthFailure("refresh-session");
  }

  return response;
}
