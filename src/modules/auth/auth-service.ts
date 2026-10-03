import type { AuthFailureReporter } from "@/lib/auth-failure";

import { parseSignInInput } from "./auth-boundaries";

export interface AuthGateway {
  signInWithPassword(credentials: {
    readonly email: string;
    readonly password: string;
  }): Promise<boolean>;
  currentActor(): Promise<AuthActor | null>;
  signOut(): Promise<void>;
}

export interface AuthActor {
  readonly id: string;
}

const ignoreAuthFailure: AuthFailureReporter = () => {};

export type SignInResult =
  | {
      readonly status: "invalid";
      readonly fieldErrors: Partial<
        Record<"email" | "password", readonly string[]>
      >;
    }
  | { readonly status: "success"; readonly nextPath: string }
  | { readonly status: "error"; readonly message: string };

export class AuthService {
  constructor(
    private readonly gateway: AuthGateway,
    private readonly reportFailure: AuthFailureReporter = ignoreAuthFailure,
  ) {}

  async signIn(input: unknown): Promise<SignInResult> {
    const parsed = parseSignInInput(input);

    if (!parsed.success) {
      return { status: "invalid", fieldErrors: parsed.fieldErrors };
    }

    try {
      const authenticated = await this.gateway.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (authenticated) {
        return { status: "success", nextPath: parsed.data.nextPath };
      }
    } catch {
      this.reportFailure("sign-in");
      // The public result intentionally hides provider and account details.
    }

    return {
      status: "error",
      message: "We couldn't sign you in. Check the details and try again.",
    };
  }

  async signOut(): Promise<void> {
    await this.gateway.signOut();
  }

  async currentActor(): Promise<AuthActor | null> {
    try {
      return await this.gateway.currentActor();
    } catch {
      this.reportFailure("current-actor");
      return null;
    }
  }
}
