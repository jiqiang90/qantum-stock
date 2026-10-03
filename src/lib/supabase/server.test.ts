import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseServerClient } from "./server";

vi.mock("server-only", () => ({}));
vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const mockedCreateServerClient = vi.mocked(createServerClient);
const mockedCookies = vi.mocked(cookies);

type CookieAdapter = {
  getAll(): Array<{ name: string; value: string }>;
  setAll(
    cookies: Array<{
      name: string;
      value: string;
      options: { httpOnly?: boolean };
    }>,
  ): void;
};

describe("createSupabaseServerClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
  });

  it("adapts the request cookie store for Supabase SSR", async () => {
    const cookieStore = {
      getAll: vi.fn().mockReturnValue([{ name: "existing", value: "cookie" }]),
      set: vi.fn(),
    };
    const client = { auth: {} };
    mockedCookies.mockResolvedValue(cookieStore as never);
    mockedCreateServerClient.mockReturnValue(client as never);

    await expect(createSupabaseServerClient()).resolves.toBe(client);

    const cookieAdapter = mockedCreateServerClient.mock.calls[0]?.[2]
      .cookies as CookieAdapter;
    expect(cookieAdapter.getAll()).toEqual([
      { name: "existing", value: "cookie" },
    ]);
    cookieAdapter.setAll([
      { name: "updated", value: "value", options: { httpOnly: true } },
    ]);
    expect(cookieStore.set).toHaveBeenCalledWith(
      "updated",
      "value",
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("allows Server Components to ignore cookie writes they cannot perform", async () => {
    const cookieStore = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(() => {
        throw new Error("read-only cookie store");
      }),
    };
    mockedCookies.mockResolvedValue(cookieStore as never);
    mockedCreateServerClient.mockReturnValue({ auth: {} } as never);

    await createSupabaseServerClient();
    const cookieAdapter = mockedCreateServerClient.mock.calls[0]?.[2]
      .cookies as CookieAdapter;

    expect(() =>
      cookieAdapter.setAll([{ name: "updated", value: "value", options: {} }]),
    ).not.toThrow();
  });
});
