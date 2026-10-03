import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

import { createAuthService } from "./create-auth-service";

describe("createAuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports a safe operation-only event when the provider throws", async () => {
    const providerMessage = "provider leaked user@example.test";
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockRejectedValue(new Error(providerMessage)),
      },
    });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const service = await createAuthService();
    const actor = await service.currentActor();

    expect(actor).toBeNull();
    expect(consoleError).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(
      JSON.stringify({
        event: "auth_operation_failure",
        operation: "current-actor",
      }),
    );
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain(
      providerMessage,
    );

    consoleError.mockRestore();
  });
});
