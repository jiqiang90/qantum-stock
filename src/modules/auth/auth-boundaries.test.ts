import { describe, expect, it } from "vitest";

import { parseSignInInput, parseSignInNextPath } from "./auth-boundaries";

describe("parseSignInInput", () => {
  it("normalizes valid credentials and preserves a local return path", () => {
    expect(
      parseSignInInput({
        email: "  Team.Leader@example.com ",
        password: " demo-password ",
        nextPath:
          "/work-packages/20000000-0000-0000-0000-000000000001?option=2",
      }),
    ).toEqual({
      success: true,
      data: {
        email: "team.leader@example.com",
        password: " demo-password ",
        nextPath:
          "/work-packages/20000000-0000-0000-0000-000000000001?option=2",
      },
    });
  });

  it.each([
    "https://evil.example/path",
    "//evil.example/path",
    "/\\evil.example/path",
    "/products\nSet-Cookie: unsafe=true",
    "javascript:x",
  ])(
    "replaces unsafe return path %s with the Work Package list",
    (nextPath) => {
      const result = parseSignInInput({
        email: "team.leader@example.com",
        password: "demo-password",
        nextPath,
      });

      expect(result).toMatchObject({
        success: true,
        data: { nextPath: "/" },
      });
    },
  );

  it("returns field errors without echoing the submitted password", () => {
    const result = parseSignInInput({
      email: "not-an-email",
      password: "",
      nextPath: "/",
    });

    expect(result).toEqual({
      success: false,
      fieldErrors: {
        email: ["Enter a valid email address."],
        password: ["Enter your password."],
      },
    });
    expect(JSON.stringify(result)).not.toContain("not-an-email:");
  });
});

describe("parseSignInNextPath", () => {
  it("accepts one query value and rejects arrays and external locations", () => {
    expect(parseSignInNextPath("/products")).toBe("/products");
    expect(parseSignInNextPath(["/products"])).toBe("/");
    expect(parseSignInNextPath("//external.example")).toBe("/");
    expect(parseSignInNextPath(undefined)).toBe("/");
  });
});
