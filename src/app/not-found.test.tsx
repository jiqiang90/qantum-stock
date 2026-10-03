import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("root not-found boundary", () => {
  it("describes an unmatched route without assigning it to one capability", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
    expect(screen.queryByText(/Work Package not found/i)).toBeNull();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("keeps capability-specific copy at the Work Package route boundary", () => {
    expect(
      existsSync(
        resolve(import.meta.dirname, "work-packages/[id]/not-found.tsx"),
      ),
    ).toBe(true);
  });
});
