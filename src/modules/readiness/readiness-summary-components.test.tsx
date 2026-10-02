import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CombinedAvailabilitySelector } from "./combined-availability-selector";
import { CopySummary } from "./copy-summary";
import type {
  SolutionReference,
  WorkPackageReadiness,
} from "./readiness-model";
import { WorkPackageDetail } from "./work-package-detail";
import { WorkPackageSelectionSummary } from "./work-package-selection-summary";

const { replaceRoute } = vi.hoisted(() => ({
  replaceRoute: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceRoute }),
}));

beforeEach(() => {
  replaceRoute.mockReset();
});

describe("CombinedAvailabilitySelector", () => {
  it("renders same-route multi-selection only in combined mode", () => {
    render(
      <CombinedAvailabilitySelector
        filters={{ query: "package", status: "all" }}
        items={[
          workPackageReadiness("ready", "READY"),
          workPackageReadiness("shortage", "SHORTAGE"),
        ]}
        selectedIds={["shortage", "hidden"]}
        selectionAttempted
        totalCount={3}
      />,
    );

    const form = screen.getByRole("form", {
      name: "Check combined availability",
    });
    expect(form).toHaveAttribute("action", "/");
    expect(within(form).getByDisplayValue("combined")).toHaveAttribute(
      "name",
      "mode",
    );
    expect(
      within(form).getByRole("checkbox", {
        name: "Select Work Package shortage",
      }),
    ).toBeChecked();
    expect(within(form).getAllByRole("checkbox")).toHaveLength(2);
    expect(within(form).getByRole("alert")).toHaveTextContent(
      "Select at least two Work Packages",
    );
    expect(
      screen.getByRole("link", { name: "Exit combined availability" }),
    ).toHaveAttribute("href", "/?q=package");
  });
});

describe("WorkPackageSelectionSummary", () => {
  it("shows aggregate Product demand without assigning the shortage", () => {
    render(
      <WorkPackageSelectionSummary
        closeHref="/?mode=combined&workPackage=work-package-a&workPackage=work-package-b"
        assessment={{
          status: "SHORTAGE",
          workPackageIds: ["work-package-a", "work-package-b"],
          products: [
            {
              product: {
                id: "product-fire-collar",
                productCode: "SC-100",
                name: "SC-100 Fire Collar",
                canonicalUnit: "each",
              },
              knownRequiredQuantity: 12,
              requiredQuantityIncomplete: false,
              availableQuantity: 10,
              missingQuantity: 2,
              inventoryCapturedAt: "2026-10-02T00:00:00.000Z",
              status: "SHORTAGE",
              reason: "INSUFFICIENT_QUANTITY",
            },
          ],
          unmappedRequirementCount: 0,
          workPackagesWithoutRequirements: 0,
        }}
        workPackages={[
          {
            id: "work-package-a",
            name: "Level 2 service riser",
            plannedDate: "2026-10-08",
          },
          {
            id: "work-package-b",
            name: "Level 3 east riser",
            plannedDate: "2026-10-09",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Combined Availability Report" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Combined Availability Report" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 Work Packages selected")).toBeInTheDocument();
    expect(screen.getByText("12 each")).toBeInTheDocument();
    expect(screen.getByText("10 each")).toBeInTheDocument();
    expect(screen.getByText("2 each")).toBeInTheDocument();
    expect(
      screen.getByText(
        /does not reserve stock or decide which package receives it/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Summary preview",
      }).value,
    ).toContain("COMBINED MATERIAL SHORTAGE SUMMARY");
    expect(
      screen.getByRole("button", { name: "Copy summary" }),
    ).toBeInTheDocument();
  });

  it("closes the report, preserves the selection URL, and restores focus", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button id="check-combined-availability" type="button">
          Check availability
        </button>
        <WorkPackageSelectionSummary
          closeHref="/?mode=combined&workPackage=work-package-a&workPackage=work-package-b"
          assessment={{
            status: "READY",
            workPackageIds: ["work-package-a", "work-package-b"],
            products: [],
            unmappedRequirementCount: 0,
            workPackagesWithoutRequirements: 0,
          }}
          workPackages={[
            {
              id: "work-package-a",
              name: "Level 2 service riser",
              plannedDate: "2026-10-08",
            },
            {
              id: "work-package-b",
              name: "Level 3 east riser",
              plannedDate: "2026-10-09",
            },
          ]}
        />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Close report" }));

    expect(replaceRoute).toHaveBeenCalledWith(
      "/?mode=combined&workPackage=work-package-a&workPackage=work-package-b",
      { scroll: false },
    );
    expect(
      screen.getByRole("button", { name: "Check availability" }),
    ).toHaveFocus();
  });
});

describe("CopySummary", () => {
  it("copies the visible summary and reports only Copied", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<CopySummary summary="Visible shortage evidence" />);

    await user.click(screen.getByRole("button", { name: "Copy summary" }));

    expect(writeText).toHaveBeenCalledWith("Visible shortage evidence");
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
    expect(
      screen.queryByText(/sent|reported|escalated/i),
    ).not.toBeInTheDocument();
  });

  it("keeps a selectable preview when clipboard access fails", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<CopySummary summary="Visible shortage evidence" />);

    await user.click(screen.getByRole("button", { name: "Copy summary" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Select and copy the summary manually",
    );
    expect(
      screen.getByRole("textbox", { name: "Summary preview" }),
    ).toHaveValue("Visible shortage evidence");
  });
});

describe("WorkPackage shortage summary", () => {
  it("previews a selected single-package blocker with a trimmed note", async () => {
    const user = userEvent.setup();
    const baseItem = workPackageReadiness("summary", "SHORTAGE");
    const requirement = {
      requirementId: "90000000-0000-0000-0000-000000000001",
      description: "Seal annular gaps",
      product: {
        id: "30000000-0000-0000-0000-000000000001",
        productCode: "IS-310",
        name: "IS-310 Intumescent Sealant",
        canonicalUnit: "cartridge",
      },
      requiredQuantity: 4,
      availableQuantity: 0,
      missingQuantity: 4,
      inventoryCapturedAt: "2026-10-02T00:00:00Z",
      status: "SHORTAGE" as const,
      reason: "INSUFFICIENT_QUANTITY" as const,
    };
    const assessment = {
      status: "SHORTAGE" as const,
      reason: null,
      requirements: [requirement],
    };
    const item: WorkPackageReadiness = {
      ...baseItem,
      assessment,
      solutionOptions: baseItem.solutionOptions.map((option) => ({
        ...option,
        assessment,
      })),
    };
    render(<WorkPackageDetail item={item} />);

    await user.click(
      screen.getByRole("checkbox", { name: /Seal annular gaps/i }),
    );
    await user.type(
      screen.getByRole("textbox", { name: "Optional note" }),
      "  Confirm delivery  ",
    );
    await user.click(screen.getByRole("button", { name: "Preview summary" }));

    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Summary preview",
      }).value,
    ).toContain("Note: Confirm delivery");
  });

  it("does not offer a Shortage Summary when all requirements are ready", () => {
    render(<WorkPackageDetail item={workPackageReadiness("ready", "READY")} />);

    expect(
      screen.queryByRole("heading", { name: "Prepare shortage summary" }),
    ).not.toBeInTheDocument();
  });
});

function workPackageReadiness(
  id: string,
  status: WorkPackageReadiness["assessment"]["status"],
): WorkPackageReadiness {
  const option = {
    id: `option-${id}`,
    solution: solutionReference(`solution-${id}`),
    requirements: [],
  };
  const assessment = {
    status,
    reason: status === "UNKNOWN" ? ("NO_REQUIREMENTS" as const) : null,
    requirements: [],
  };

  return {
    workPackage: {
      id,
      name: `Work Package ${id}`,
      plannedDate: "2026-10-08",
      selectedSolutionOptionId: option.id,
      solutionOptions: [option],
    },
    selectedOption: option,
    assessment,
    solutionOptions: [{ option, assessment, selected: true }],
  };
}

function solutionReference(id: string): SolutionReference {
  return {
    id,
    internalCode: "0444",
    supplierRefCode: "V21.2-21SFR00051-98-A",
    supplier: "Ryanfire",
    orientation: "Wall",
    substrate: "FR plasterboard, FR plasterboard wall (1 layer 13mm)",
    serviceClassification: "Combustible Pipe",
    serviceType: "PVC Pipe",
    serviceSize: "Ø40mm",
    integrity: "60",
    insulation: "60",
    serviceTypeOption: "PVC Pipe",
    substrateOption: "Plasterboard Wall",
  };
}
