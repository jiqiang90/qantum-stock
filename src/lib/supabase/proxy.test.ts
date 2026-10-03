import { createServerClient } from "@supabase/ssr";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateSupabaseSession } from "./proxy";

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

const mockedCreateServerClient = vi.mocked(createServerClient);

type CookieAdapter = {
  setAll(
    cookies: Array<{
      name: string;
      value: string;
      options: { httpOnly: boolean; sameSite: "lax" };
    }>,
  ): void;
};

describe("updateSupabaseSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
  });

  it("verifies claims and carries refreshed cookies into the response", async () => {
    const getClaims = vi.fn();

    mockedCreateServerClient.mockImplementation((_url, _key, options) => {
      getClaims.mockImplementation(async () => {
        (options.cookies as unknown as CookieAdapter).setAll([
          {
            name: "sb-session",
            value: "refreshed",
            options: { httpOnly: true, sameSite: "lax" },
          },
        ]);
        return { data: null, error: null };
      });

      return { auth: { getClaims } } as never;
    });

    const request = new NextRequest("https://app.example/work-packages", {
      headers: { cookie: "existing=value" },
    });
    const response = await updateSupabaseSession(request);

    expect(getClaims).toHaveBeenCalledOnce();
    expect(response.cookies.get("sb-session")?.value).toBe("refreshed");
    expect(mockedCreateServerClient).toHaveBeenCalledWith(
      "https://demo.supabase.co",
      "publishable-key",
      expect.objectContaining({ cookies: expect.any(Object) }),
    );
  });

  it("reports a returned refresh failure without exposing provider details", async () => {
    const providerMessage = "provider leaked user@example.test";
    mockedCreateServerClient.mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: null,
          error: new Error(providerMessage),
        }),
      },
    } as never);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await updateSupabaseSession(
      new NextRequest("https://app.example/work-packages"),
    );

    expect(consoleError).toHaveBeenCalledWith(
      JSON.stringify({
        event: "auth_operation_failure",
        operation: "refresh-session",
      }),
    );
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain(
      providerMessage,
    );
    consoleError.mockRestore();
  });

  it("does not report an anonymous request as an auth failure", async () => {
    mockedCreateServerClient.mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: null,
          error: new AuthSessionMissingError(),
        }),
      },
    } as never);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await updateSupabaseSession(
      new NextRequest("https://app.example/work-packages"),
    );

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
