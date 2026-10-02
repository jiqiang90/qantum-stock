import { describe, expect, it } from "vitest";

import {
  parseSupabaseReadConfig,
  parseWorkPackageListFilters,
  parseWorkPackageSelection,
  parseWorkPackageId,
} from "./readiness-boundaries";

describe("parseWorkPackageListFilters", () => {
  it("normalizes valid search and readiness filters", () => {
    expect(
      parseWorkPackageListFilters({ q: "  riser  ", status: "SHORTAGE" }),
    ).toEqual({ query: "riser", status: "SHORTAGE" });
  });

  it("falls back safely for malformed or unsupported filters", () => {
    expect(
      parseWorkPackageListFilters({
        q: "x".repeat(101),
        status: "BLOCKED",
      }),
    ).toEqual({ query: "", status: "all" });
  });
});

describe("parseSupabaseReadConfig", () => {
  it("accepts the public URL and publishable key used by the read client", () => {
    expect(
      parseSupabaseReadConfig({
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-key",
      }),
    ).toEqual({
      url: "http://127.0.0.1:54321",
      publishableKey: "public-key",
    });
  });

  it("throws a public-safe error when configuration is absent", () => {
    expect(() => parseSupabaseReadConfig({})).toThrow(
      "Material readiness data is not configured.",
    );
  });
});

describe("parseWorkPackageSelection", () => {
  it("deduplicates valid selected Work Package IDs and ignores malformed values", () => {
    expect(
      parseWorkPackageSelection({
        compare: "1",
        workPackage: [
          "20000000-0000-0000-0000-000000000001",
          "not-an-id",
          "20000000-0000-0000-0000-000000000001",
          "20000000-0000-0000-0000-000000000002",
        ],
      }),
    ).toEqual({
      attempted: true,
      ids: [
        "20000000-0000-0000-0000-000000000001",
        "20000000-0000-0000-0000-000000000002",
      ],
    });
  });

  it("returns an untouched initial state when comparison was not requested", () => {
    expect(parseWorkPackageSelection({})).toEqual({
      attempted: false,
      ids: [],
    });
  });
});

describe("parseWorkPackageId", () => {
  it("accepts a Postgres UUID even when it has no RFC version nibble", () => {
    expect(parseWorkPackageId("20000000-0000-0000-0000-000000000003")).toBe(
      "20000000-0000-0000-0000-000000000003",
    );
  });

  it("returns null for an invalid route value", () => {
    expect(parseWorkPackageId("not-an-id")).toBeNull();
  });
});
