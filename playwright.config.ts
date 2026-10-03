import { defineConfig, devices } from "@playwright/test";

const webServerCommand =
  process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? "npm run dev";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const hasAuthenticatedJourney = Boolean(
  process.env.E2E_TEAM_LEADER_EMAIL && process.env.E2E_TEAM_LEADER_PASSWORD,
);
const webServerEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] => entry[1] !== undefined,
  ),
);
webServerEnvironment.E2E_TEAM_LEADER_EMAIL = "";
webServerEnvironment.E2E_TEAM_LEADER_PASSWORD = "";
webServerEnvironment.SUPABASE_SERVICE_ROLE_KEY = "";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI || hasAuthenticatedJourney ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: webServerCommand,
    env: webServerEnvironment,
    reuseExistingServer:
      !process.env.CI &&
      process.env.PLAYWRIGHT_WEB_SERVER_COMMAND === undefined,
    url: baseURL,
  },
});
