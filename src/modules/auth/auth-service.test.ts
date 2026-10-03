import { describe, expect, it } from "vitest";

import { AuthService, type AuthGateway } from "./auth-service";

describe("AuthService", () => {
  it("returns validation errors before asking Supabase to authenticate", async () => {
    const gateway = new FakeAuthGateway(true);
    const service = new AuthService(gateway);

    await expect(
      service.signIn({ email: "invalid", password: "", nextPath: "/" }),
    ).resolves.toEqual({
      status: "invalid",
      fieldErrors: {
        email: ["Enter a valid email address."],
        password: ["Enter your password."],
      },
    });
    expect(gateway.signInCalls).toEqual([]);
  });

  it("returns the safe continuation after successful authentication", async () => {
    const gateway = new FakeAuthGateway(true);
    const service = new AuthService(gateway);

    await expect(
      service.signIn({
        email: "TEAM.LEADER@example.com",
        password: "demo-password",
        nextPath: "/work-packages/work-package-1",
      }),
    ).resolves.toEqual({
      status: "success",
      nextPath: "/work-packages/work-package-1",
    });
    expect(gateway.signInCalls).toEqual([
      {
        email: "team.leader@example.com",
        password: "demo-password",
      },
    ]);
  });

  it("returns one generic error when Supabase rejects the credentials", async () => {
    const gateway = new FakeAuthGateway(false);
    const service = new AuthService(gateway);

    await expect(
      service.signIn({
        email: "team.leader@example.com",
        password: "wrong-password",
        nextPath: "/",
      }),
    ).resolves.toEqual({
      status: "error",
      message: "We couldn't sign you in. Check the details and try again.",
    });
  });

  it("reports a provider exception without changing the public sign-in result", async () => {
    const providerError = new Error("provider detail must stay private");
    const gateway = new FakeAuthGateway(true);
    gateway.signInError = providerError;
    const reportedOperations: string[] = [];
    const service = new AuthService(gateway, (operation) => {
      reportedOperations.push(operation);
    });

    await expect(
      service.signIn({
        email: "team.leader@example.com",
        password: "demo-password",
        nextPath: "/",
      }),
    ).resolves.toEqual({
      status: "error",
      message: "We couldn't sign you in. Check the details and try again.",
    });
    expect(reportedOperations).toEqual(["sign-in"]);
  });

  it("reports a current-session exception and fails closed to anonymous", async () => {
    const gateway = new FakeAuthGateway(true);
    gateway.currentActorError = new Error("provider unavailable");
    const reportedOperations: string[] = [];
    const service = new AuthService(gateway, (operation) => {
      reportedOperations.push(operation);
    });

    await expect(service.currentActor()).resolves.toBeNull();
    expect(reportedOperations).toEqual(["current-actor"]);
  });

  it("exposes the verified current actor and delegates sign out", async () => {
    const gateway = new FakeAuthGateway(true);
    gateway.actor = { id: "user-1" };
    const service = new AuthService(gateway);

    await expect(service.currentActor()).resolves.toEqual(gateway.actor);
    await service.signOut();

    expect(gateway.signOutCalls).toBe(1);
  });
});

class FakeAuthGateway implements AuthGateway {
  readonly signInCalls: { email: string; password: string }[] = [];
  actor: { id: string } | null = null;
  currentActorError: Error | null = null;
  signInError: Error | null = null;
  signOutCalls = 0;

  constructor(private readonly succeeds: boolean) {}

  async signInWithPassword(credentials: {
    readonly email: string;
    readonly password: string;
  }): Promise<boolean> {
    if (this.signInError !== null) {
      throw this.signInError;
    }

    this.signInCalls.push(credentials);
    return this.succeeds;
  }

  async currentActor(): Promise<{ id: string } | null> {
    if (this.currentActorError !== null) {
      throw this.currentActorError;
    }

    return this.actor;
  }

  async signOut(): Promise<void> {
    this.signOutCalls += 1;
  }
}
