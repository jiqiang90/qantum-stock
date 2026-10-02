import type { AuthActor, AuthGateway } from "./auth-service";

interface SupabaseAuthClient {
  readonly auth: {
    signInWithPassword(credentials: {
      readonly email: string;
      readonly password: string;
    }): Promise<{ readonly error: unknown }>;
    getClaims(): Promise<{
      readonly data: {
        readonly claims: {
          readonly sub?: unknown;
        };
      } | null;
      readonly error: unknown;
    }>;
    signOut(): Promise<{ readonly error: unknown }>;
  };
}

export class SupabaseAuthGateway implements AuthGateway {
  constructor(private readonly client: SupabaseAuthClient) {}

  async signInWithPassword(credentials: {
    readonly email: string;
    readonly password: string;
  }): Promise<boolean> {
    const { error } = await this.client.auth.signInWithPassword(credentials);
    return error === null;
  }

  async currentActor(): Promise<AuthActor | null> {
    const { data, error } = await this.client.auth.getClaims();
    const subject = data?.claims.sub;

    if (error !== null || typeof subject !== "string" || !subject) {
      return null;
    }

    return { id: subject };
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error !== null) {
      throw error;
    }
  }
}
