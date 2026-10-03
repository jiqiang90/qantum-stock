import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { parse } from "yaml";
import { describe, expect, it } from "vitest";

type WorkflowStep = {
  env?: Record<string, string>;
  id?: string;
  if?: string;
  name?: string;
  run?: string;
  uses?: string;
  with?: Record<string, string>;
};

type DeployWorkflow = {
  concurrency?: {
    "cancel-in-progress"?: boolean;
    group?: string;
  };
  jobs?: Record<
    string,
    {
      env?: Record<string, string>;
      environment?: string;
      if?: string;
      permissions?: Record<string, string>;
      steps?: WorkflowStep[];
      "timeout-minutes"?: number;
    }
  >;
  on?: {
    workflow_dispatch?: unknown;
    workflow_run?: {
      branches?: string[];
      types?: string[];
      workflows?: string[];
    };
  };
};

type VercelConfig = {
  git?: {
    deploymentEnabled?: boolean | Record<string, boolean>;
  };
};

type PackageJson = {
  scripts?: Record<string, string>;
};

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const workflowPath = path.join(
  repositoryRoot,
  ".github",
  "workflows",
  "deploy.yml",
);
const ciWorkflowPath = path.join(
  repositoryRoot,
  ".github",
  "workflows",
  "ci.yml",
);
const vercelConfigPath = path.join(repositoryRoot, "vercel.json");
const rootPagePath = path.join(repositoryRoot, "src", "app", "page.tsx");
const packageJsonPath = path.join(repositoryRoot, "package.json");
const playwrightConfigPath = path.join(repositoryRoot, "playwright.config.ts");

function readWorkflow(): DeployWorkflow {
  return parse(fs.readFileSync(workflowPath, "utf8")) as DeployWorkflow;
}

function readCiWorkflow(): DeployWorkflow {
  return parse(fs.readFileSync(ciWorkflowPath, "utf8")) as DeployWorkflow;
}

function readVercelConfig(): VercelConfig {
  return JSON.parse(fs.readFileSync(vercelConfigPath, "utf8")) as VercelConfig;
}

function readPackageJson(): PackageJson {
  return JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson;
}

describe("production deployment workflow", () => {
  it("disables native Vercel deployment only for main", () => {
    expect(readVercelConfig().git?.deploymentEnabled).toEqual({ main: false });
  });

  it("supports manual runs and automatic runs after main CI completes", () => {
    const workflow = readWorkflow();

    expect(workflow.on?.workflow_dispatch).toBeDefined();
    expect(workflow.on?.workflow_run).toEqual({
      branches: ["main"],
      types: ["completed"],
      workflows: ["CI"],
    });
  });

  it("deploys only successful CI revisions and checks out the verified SHA", () => {
    const deploy = readWorkflow().jobs?.deploy;
    const checkout = deploy?.steps?.find(
      (step) => step.uses === "actions/checkout@v7",
    );

    expect(deploy?.if).toContain(
      "github.event.workflow_run.conclusion == 'success'",
    );
    expect(deploy?.if).toContain("github.event.workflow_run.event == 'push'");
    expect(deploy?.if).toContain(
      "github.event.workflow_run.head_branch == 'main'",
    );
    expect(deploy?.if).toContain("github.ref == 'refs/heads/main'");
    expect(checkout?.with?.ref).toContain("github.event.workflow_run.head_sha");
  });

  it("cancels stale CI runs so an older revision cannot deploy last", () => {
    expect(readCiWorkflow().concurrency).toEqual({
      "cancel-in-progress": true,
      group: "ci-${{ github.workflow }}-${{ github.ref }}",
    });
  });

  it("gates deployment on coverage, database permissions, and production browser journeys", () => {
    const quality = readCiWorkflow().jobs?.quality;
    const steps = quality?.steps ?? [];
    const stepNames = steps.map(({ name }) => name);
    const serializedSteps = JSON.stringify(steps);
    const exportEnvironment = steps.find(
      ({ name }) => name === "Export local Supabase environment",
    );
    const provisionActor = steps.find(
      ({ name }) => name === "Provision local Demo Team Leader",
    );
    const generateCredentials = steps.find(
      ({ name }) => name === "Generate local browser-test credentials",
    );
    const browserJourneys = steps.find(
      ({ name }) => name === "Run production browser journeys",
    );

    expect(quality?.["timeout-minutes"]).toBe(20);
    expect(quality?.env).toBeUndefined();
    expect(stepNames).toContain("Start local Supabase");
    expect(stepNames).toContain("Reset and test database");
    expect(stepNames).toContain("Generate local browser-test credentials");
    expect(stepNames).toContain("Provision local Demo Team Leader");
    expect(stepNames).toContain("Install Chromium");
    expect(stepNames).toContain("Run production browser journeys");
    expect(stepNames).toContain("Upload browser failure evidence");
    expect(stepNames).toContain("Stop local Supabase");
    expect(readPackageJson().scripts?.check).toContain("npm run test:coverage");
    expect(serializedSteps).toContain("npm run db:test");
    expect(serializedSteps).toContain("npm run test:e2e");
    expect(serializedSteps).toContain("PLAYWRIGHT_WEB_SERVER_COMMAND");
    expect(exportEnvironment?.run).not.toContain(
      'echo "SUPABASE_SERVICE_ROLE_KEY=',
    );
    expect(provisionActor?.run).toContain(
      'SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"',
    );
    expect(provisionActor?.env).toEqual({
      E2E_TEAM_LEADER_EMAIL: "ci-team-leader@example.test",
      E2E_TEAM_LEADER_PASSWORD: "${{ steps.e2e_credentials.outputs.password }}",
    });
    expect(browserJourneys?.env).toEqual({
      E2E_TEAM_LEADER_EMAIL: "ci-team-leader@example.test",
      E2E_TEAM_LEADER_PASSWORD: "${{ steps.e2e_credentials.outputs.password }}",
      PLAYWRIGHT_WEB_SERVER_COMMAND: "npm run start",
    });
    expect(generateCredentials).toMatchObject({
      id: "e2e_credentials",
      run: expect.stringContaining("openssl rand -hex 24"),
    });
    expect(generateCredentials?.run).toContain("::add-mask::");
    expect(generateCredentials?.run).toContain("$GITHUB_OUTPUT");
    expect(fs.readFileSync(playwrightConfigPath, "utf8")).toContain(
      'screenshot: "only-on-failure"',
    );
  });

  it("reruns the repository quality gate before a manual deployment", () => {
    const steps = readWorkflow().jobs?.deploy?.steps ?? [];
    const qualityStepIndex = steps.findIndex(
      (step) => step.name === "Run manual quality gate",
    );
    const deployStepIndex = steps.findIndex(
      (step) => step.name === "Deploy production",
    );

    expect(qualityStepIndex).toBeGreaterThan(-1);
    expect(steps[qualityStepIndex]?.if).toContain("workflow_dispatch");
    expect(steps[qualityStepIndex]?.run).toBe("npm run check");
    expect(deployStepIndex).toBeGreaterThan(qualityStepIndex);
  });

  it("deploys the selected SHA through the Vercel REST API with valid shell", () => {
    const deployStep = readWorkflow().jobs?.deploy?.steps?.find(
      (step) => step.name === "Deploy production",
    );
    const script = deployStep?.run ?? "";

    expect(script).toContain("https://api.vercel.com/v13/deployments");
    expect(script).toContain('target: "production"');
    expect(script).toContain("sha: process.env.DEPLOY_SHA");
    expect(script).not.toContain("npx vercel");
    expect(() => execFileSync("bash", ["-n"], { input: script })).not.toThrow();
  });

  it("isolates production secrets and smoke-checks the deployed application", () => {
    const workflow = readWorkflow();
    const deploy = workflow.jobs?.deploy;
    const serializedWorkflow = JSON.stringify(workflow);

    expect(deploy?.environment).toBe("production");
    expect(deploy?.permissions).toEqual({ contents: "read" });
    expect(workflow.concurrency).toEqual({
      "cancel-in-progress": false,
      group: "production-deployment",
    });
    expect(serializedWorkflow).toContain("secrets.VERCEL_TOKEN");
    expect(serializedWorkflow).toContain("secrets.VERCEL_ORG_ID");
    expect(serializedWorkflow).toContain("secrets.VERCEL_PROJECT_ID");
    expect(serializedWorkflow).not.toMatch(
      /SUPABASE_(?:SECRET|SERVICE_ROLE|JWT)|POSTGRES_/,
    );

    expect(JSON.stringify(deploy?.env)).not.toContain("secrets.VERCEL_");
    const deployStep = deploy?.steps?.find(
      (step) => step.name === "Deploy production",
    );
    expect(deployStep?.env).toEqual({
      VERCEL_ORG_ID: "${{ secrets.VERCEL_ORG_ID }}",
      VERCEL_PROJECT_ID: "${{ secrets.VERCEL_PROJECT_ID }}",
      VERCEL_TOKEN: "${{ secrets.VERCEL_TOKEN }}",
    });

    const smokeCheck = deploy?.steps?.find(
      (step) => step.name === "Smoke-check deployment",
    );
    expect(fs.existsSync(rootPagePath)).toBe(true);
    expect(smokeCheck?.run).toContain(
      '"${{ steps.deploy.outputs.deployment_url }}/"',
    );
    expect(smokeCheck?.run).not.toContain("/work-packages");
    expect(smokeCheck?.run).toContain("curl --fail");
    expect(smokeCheck?.run).toContain("--connect-timeout 10");
    expect(smokeCheck?.run).toContain("--max-time 30");
  });
});
