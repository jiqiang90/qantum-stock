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
