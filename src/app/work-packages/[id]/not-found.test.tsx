import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WorkPackageNotFound from "./not-found";

describe("Work Package not-found boundary", () => {
  it("keeps Work Package-specific recovery guidance at this route", () => {
    render(<WorkPackageNotFound />);

    expect(
      screen.getByRole("heading", { name: "Work Package not found" }),
    ).toBeVisible();
    expect(
      screen.getByText(/No Material Readiness result has been inferred/i),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Return to Work Packages" }),
    ).toHaveAttribute("href", "/");
  });
});
