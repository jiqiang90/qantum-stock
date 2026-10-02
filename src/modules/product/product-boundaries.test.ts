import { describe, expect, it } from "vitest";

import {
  parseProductDetailTab,
  parseProductId,
  parseProductListFilters,
} from "./product-boundaries";

describe("parseProductId", () => {
  it("accepts the UUID format used by the synthetic records", () => {
    expect(parseProductId("40000000-0000-0000-0000-000000000003")).toBe(
      "40000000-0000-0000-0000-000000000003",
    );
  });

  it("returns null for a malformed route value", () => {
    expect(parseProductId("not-an-id")).toBeNull();
  });
});

describe("parseProductListFilters", () => {
  it("trims a valid search and accepts documented filters", () => {
    expect(
      parseProductListFilters({
        q: "  collar  ",
        usage: "unused",
        inventory: "unknown",
      }),
    ).toEqual({
      query: "collar",
      usage: "unused",
      inventory: "unknown",
    });
  });

  it("uses safe defaults for missing values", () => {
    expect(parseProductListFilters({})).toEqual({
      query: "",
      usage: "all",
      inventory: "all",
    });
  });

  it("uses safe defaults for arrays and invalid enum values", () => {
    expect(
      parseProductListFilters({
        q: ["collar", "sealant"],
        usage: ["used", "unused"],
        inventory: "available",
      }),
    ).toEqual({
      query: "",
      usage: "all",
      inventory: "all",
    });
  });

  it("uses an empty search for whitespace or more than 100 characters", () => {
    expect(parseProductListFilters({ q: "   " }).query).toBe("");
    expect(parseProductListFilters({ q: "x".repeat(101) }).query).toBe("");
  });
});

describe("parseProductDetailTab", () => {
  it("selects Work Package usage only for the documented usage value", () => {
    expect(parseProductDetailTab("usage")).toBe("usage");
  });

  it.each([undefined, "details", "other", ["usage", "details"]])(
    "uses Product details for %j",
    (value) => {
      expect(parseProductDetailTab(value)).toBe("details");
    },
  );
});
