import { AuthSessionMissingError } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { SupabaseAuthGateway } from "./supabase-auth-gateway";

describe("SupabaseAuthGateway", () => {
  it("maps successful password authentication without leaking provider data", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    const gateway = new SupabaseAuthGateway(fakeClient({ signInWithPassword }));

    await expect(
      gateway.signInWithPassword({
        email: "leader@example.com",
        password: "secret",
      }),
    ).resolves.toBe(true);
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "leader@example.com",
      password: "secret",
    });
  });

  it("surfaces a returned password-authentication error to the service", async () => {
    const providerError = new Error("provider unavailable");
    const gateway = new SupabaseAuthGateway(
      fakeClient({
        signInWithPassword: vi.fn().mockResolvedValue({ error: providerError }),
      }),
    );

    await expect(
      gateway.signInWithPassword({
        email: "leader@example.com",
        password: "secret",
      }),
    ).rejects.toBe(providerError);
  });

  it("returns only a verified actor from JWT claims", async () => {
    const gateway = new SupabaseAuthGateway(
      fakeClient({
        getClaims: vi.fn().mockResolvedValue({
          data: {
            claims: {
              sub: "user-1",
              email: "leader@example.com",
            },
          },
          error: null,
        }),
      }),
    );

    await expect(gateway.currentActor()).resolves.toEqual({
      id: "user-1",
    });
  });

  it("treats missing or invalid claims as anonymous", async () => {
    const gateway = new SupabaseAuthGateway(
      fakeClient({
        getClaims: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    );

    await expect(gateway.currentActor()).resolves.toBeNull();
  });

  it("treats an absent session as anonymous", async () => {
    const gateway = new SupabaseAuthGateway(
      fakeClient({
        getClaims: vi.fn().mockResolvedValue({
          data: null,
          error: new AuthSessionMissingError(),
        }),
      }),
    );

    await expect(gateway.currentActor()).resolves.toBeNull();
  });

  it("surfaces a returned claims error to the service", async () => {
    const providerError = new Error("claims unavailable");
    const gateway = new SupabaseAuthGateway(
      fakeClient({
        getClaims: vi
          .fn()
          .mockResolvedValue({ data: null, error: providerError }),
      }),
    );

    await expect(gateway.currentActor()).rejects.toBe(providerError);
  });
});

function fakeClient(overrides: Partial<FakeAuth> = {}) {
  const auth: FakeAuth = {
    signInWithPassword: vi.fn().mockResolvedValue({ error: new Error() }),
    getClaims: vi.fn().mockResolvedValue({ data: null, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    ...overrides,
  };

  return { auth };
}

interface FakeAuth {
  signInWithPassword(credentials: {
    email: string;
    password: string;
  }): Promise<{ error: unknown }>;
  getClaims(): Promise<{
    data: { claims: { sub?: unknown; email?: unknown } } | null;
    error: unknown;
  }>;
  signOut(): Promise<{ error: unknown }>;
}
