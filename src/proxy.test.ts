import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { updateSupabaseSession } from "@/lib/supabase/proxy";
import { proxy } from "./proxy";

vi.mock("@/lib/supabase/proxy", () => ({
  updateSupabaseSession: vi.fn(),
}));

describe("Next.js proxy entry", () => {
  it("delegates every matched request to the Supabase session boundary", async () => {
    const request = new NextRequest("https://app.example/products");
    const response = new Response(null, { status: 204 });
    vi.mocked(updateSupabaseSession).mockResolvedValue(response as never);

    await expect(proxy(request)).resolves.toBe(response);
  });
});
