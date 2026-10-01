import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("identifies the material-readiness workspace", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Material readiness" }),
    ).toBeInTheDocument();
  });
});
