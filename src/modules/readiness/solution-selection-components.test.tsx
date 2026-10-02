import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type {
  ReadinessAssessment,
  SolutionOptionEvidence,
  WorkPackageReadiness,
} from "./readiness-model";
import { WorkPackageDetail } from "./work-package-detail";

describe("WorkPackage Solution selection", () => {
  it("lets a public visitor preview another option without persisting it", async () => {
    const user = userEvent.setup();
    render(<WorkPackageDetail item={workPackage()} />);

    expect(screen.getByText("Selected Solution")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("READY");

    await user.click(
      screen.getByRole("radio", { name: /Ryanfire 0999.*SHORTAGE/i }),
    );

    expect(screen.getByRole("status")).toHaveTextContent("SHORTAGE");
    expect(screen.getByText("Alternative sealant")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Sign in to update Solution" }),
    ).toHaveAttribute(
      "href",
      "/sign-in?next=%2Fwork-packages%2Fwork-package-1",
    );
    expect(screen.getByText(/does not reserve stock/i)).toBeVisible();
  });

  it("submits only the selected option and expected current option", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(
      <WorkPackageDetail
        item={workPackage()}
        canChangeSolution
        selectSolutionAction={action}
      />,
    );

    await user.click(
      screen.getByRole("radio", { name: /Ryanfire 0999.*SHORTAGE/i }),
    );

    const form = screen.getByRole("form", { name: "Select Solution" });
    expect(within(form).getByDisplayValue("work-package-1")).toHaveAttribute(
      "name",
      "workPackageId",
    );
    expect(
      within(form).getByDisplayValue("option-alternative"),
    ).toHaveAttribute("name", "solutionOptionId");
    expect(within(form).getByDisplayValue("option-selected")).toHaveAttribute(
      "name",
      "expectedCurrentOptionId",
    );
    expect(
      within(form).getByRole("button", { name: "Use this Solution" }),
    ).toBeEnabled();
  });

  it("shows an honest pending state while a selection is being saved", async () => {
    const user = userEvent.setup();
    const action = vi.fn(() => new Promise<void>(() => undefined));
    render(
      <WorkPackageDetail
        item={workPackage()}
        canChangeSolution
        selectSolutionAction={action}
      />,
    );

    await user.click(
      screen.getByRole("radio", { name: /Ryanfire 0999.*SHORTAGE/i }),
    );
    await user.click(screen.getByRole("button", { name: "Use this Solution" }));

    expect(
      screen.getByRole("button", { name: "Saving selection…" }),
    ).toBeDisabled();
  });

  it("explains a stale selection without claiming a change", () => {
    render(
      <WorkPackageDetail item={workPackage()} selectionFeedback="conflict" />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The selected Solution changed elsewhere",
    );
    expect(screen.queryByText("The selected Solution was updated.")).toBeNull();
  });

  it("does not claim the write failed when its committed state is uncertain", () => {
    render(
      <WorkPackageDetail
        item={workPackage()}
        selectionFeedback="unavailable"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't confirm the selected Solution update",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Reload");
  });
});

function workPackage(): WorkPackageReadiness {
  const selected = option("selected", "0444", "Selected collar");
  const alternative = option("alternative", "0999", "Alternative sealant");
  const selectedAssessment = assessment("READY", selected);
  const alternativeAssessment = assessment("SHORTAGE", alternative);

  return {
    workPackage: {
      id: "work-package-1",
      name: "Level 2 service riser",
      plannedDate: "2026-10-08",
      selectedSolutionOptionId: selected.id,
      solutionOptions: [selected, alternative],
    },
    selectedOption: selected,
    assessment: selectedAssessment,
    solutionOptions: [
      { option: selected, assessment: selectedAssessment, selected: true },
      {
        option: alternative,
        assessment: alternativeAssessment,
        selected: false,
      },
    ],
  };
}

function option(
  id: string,
  code: string,
  description: string,
): SolutionOptionEvidence {
  return {
    id: `option-${id}`,
    solution: {
      id: `solution-${id}`,
      internalCode: code,
      supplierRefCode: `SUP-${code}`,
      supplier: "Ryanfire",
      orientation: "Wall",
      substrate: "FR plasterboard wall",
      serviceClassification: "Pipe",
      serviceType: "PVC Pipe",
      serviceSize: "Ø40mm",
      integrity: "60",
      insulation: "60",
      serviceTypeOption: "PVC Pipe",
      substrateOption: "Plasterboard Wall",
    },
    requirements: [
      {
        id: `requirement-${id}`,
        description,
        product: {
          id: `product-${id}`,
          productCode: `P-${code}`,
          name: `${description} Product`,
          canonicalUnit: "each",
        },
        requiredQuantity: id === "selected" ? 1 : 3,
        inventorySnapshot: {
          availableQuantity: id === "selected" ? 2 : 1,
          capturedAt: "2026-10-02T00:00:00Z",
        },
      },
    ],
  };
}

function assessment(
  status: ReadinessAssessment["status"],
  optionEvidence: SolutionOptionEvidence,
): ReadinessAssessment {
  const requirement = optionEvidence.requirements[0]!;
  const available = requirement.inventorySnapshot!.availableQuantity;
  const required = requirement.requiredQuantity!;

  return {
    status,
    reason: null,
    requirements: [
      {
        requirementId: requirement.id,
        description: requirement.description,
        product: requirement.product,
        requiredQuantity: required,
        availableQuantity: available,
        missingQuantity: Math.max(required - available, 0),
        inventoryCapturedAt: requirement.inventorySnapshot!.capturedAt,
        status,
        reason:
          status === "READY" ? "SUFFICIENT_QUANTITY" : "INSUFFICIENT_QUANTITY",
      },
    ],
  };
}
