import { describe, expect, it } from "vitest";

import {
  parseSupabaseReadConfig,
  parseWorkPackageListMode,
  parseWorkPackageListFilters,
  parseWorkPackageSelection,
  parseWorkPackageId,
  parseSelectSolutionCommand,
  parseSelectionFeedback,
  parseShortageSummaryInput,
} from "./readiness-boundaries";

describe("parseShortageSummaryInput", () => {
  it("trims a valid note and preserves selected requirement IDs", () => {
    expect(
      parseShortageSummaryInput({
        selectedRequirementIds: [
          "90000000-0000-0000-0000-000000000001",
          "90000000-0000-0000-0000-000000000002",
        ],
        note: "  Please confirm delivery.  ",
      }),
    ).toEqual({
      selectedRequirementIds: [
        "90000000-0000-0000-0000-000000000001",
        "90000000-0000-0000-0000-000000000002",
      ],
      note: "Please confirm delivery.",
    });
  });

  it("rejects duplicate IDs and notes longer than 500 characters", () => {
    const id = "90000000-0000-0000-0000-000000000001";
    expect(
      parseShortageSummaryInput({
        selectedRequirementIds: [id, id],
        note: "",
      }),
    ).toBeNull();
    expect(
      parseShortageSummaryInput({
        selectedRequirementIds: [id],
        note: "x".repeat(501),
      }),
    ).toBeNull();
  });
});

describe("parseWorkPackageListMode", () => {
  it("enables only the explicit combined availability mode", () => {
    expect(parseWorkPackageListMode({ mode: "combined" })).toBe("combined");
    expect(parseWorkPackageListMode({})).toBe("browse");
    expect(parseWorkPackageListMode({ mode: "compare" })).toBe("browse");
    expect(parseWorkPackageListMode({ mode: ["combined"] })).toBe("browse");
  });
});

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

describe("parseSelectSolutionCommand", () => {
  it("accepts the three UUIDs needed for an optimistic selection write", () => {
    expect(
      parseSelectSolutionCommand({
        workPackageId: "20000000-0000-0000-0000-000000000001",
        solutionOptionId: "70000000-0000-0000-0000-000000000002",
        expectedCurrentOptionId: "70000000-0000-0000-0000-000000000001",
      }),
    ).toEqual({
      workPackageId: "20000000-0000-0000-0000-000000000001",
      solutionOptionId: "70000000-0000-0000-0000-000000000002",
      expectedCurrentOptionId: "70000000-0000-0000-0000-000000000001",
    });
  });

  it("rejects partial or malformed write commands", () => {
    expect(
      parseSelectSolutionCommand({
        workPackageId: "not-a-uuid",
        solutionOptionId: "70000000-0000-0000-0000-000000000002",
      }),
    ).toBeNull();
  });
});

describe("parseSelectionFeedback", () => {
  it("keeps known feedback and ignores malformed values", () => {
    expect(parseSelectionFeedback("conflict")).toBe("conflict");
    expect(parseSelectionFeedback("changed")).toBeNull();
    expect(parseSelectionFeedback(["conflict"])).toBeNull();
    expect(parseSelectionFeedback("database-error")).toBeNull();
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
