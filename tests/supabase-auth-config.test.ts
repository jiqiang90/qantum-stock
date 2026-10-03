import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const configPath = path.resolve(
  import.meta.dirname,
  "..",
  "supabase",
  "config.toml",
);

function readSection(config: string, name: string): string {
  const start = config.indexOf(`[${name}]`);
  const remainder = config.slice(start + name.length + 2);
  const nextSection = remainder.search(/^\[/m);

  return nextSection === -1 ? remainder : remainder.slice(0, nextSection);
}

describe("local Supabase authentication", () => {
  it("allows pre-provisioned email login without enabling self-service signup", () => {
    const config = fs.readFileSync(configPath, "utf8");

    expect(readSection(config, "auth")).toMatch(/^enable_signup = false$/m);
    expect(readSection(config, "auth.email")).toMatch(
      /^enable_signup = true$/m,
    );
  });
});
