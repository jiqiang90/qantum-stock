import { afterEach, describe, expect, it, vi } from "vitest";

describe("Playwright runtime configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("isolates authenticated journeys and starts the requested server", async () => {
    vi.stubEnv("CI", "");
    vi.stubEnv("E2E_TEAM_LEADER_EMAIL", "leader@example.test");
    vi.stubEnv("E2E_TEAM_LEADER_PASSWORD", "local-password");
    vi.stubEnv("PLAYWRIGHT_BASE_URL", "http://127.0.0.1:3100");
    vi.stubEnv("PLAYWRIGHT_WEB_SERVER_COMMAND", "npm run start");

    const { default: config } = await import("../playwright.config");
    const webServer = Array.isArray(config.webServer)
      ? config.webServer[0]
      : config.webServer;

    expect(config.workers).toBe(1);
    expect(config.use?.baseURL).toBe("http://127.0.0.1:3100");
    expect(webServer).toMatchObject({
      command: "npm run start",
      reuseExistingServer: false,
      url: "http://127.0.0.1:3100",
      env: {
        E2E_TEAM_LEADER_EMAIL: "",
        E2E_TEAM_LEADER_PASSWORD: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
      },
    });
  });
});
