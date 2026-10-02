import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type {
  SolutionReference,
  WorkPackageListFilters,
  WorkPackageReadiness,
} from "./readiness-model";
import { WorkPackageSelectionSummary } from "./work-package-selection-summary";
import { WorkPackageDetail } from "./work-package-detail";
import { WorkPackageList } from "./work-package-list";
import { WorkPackageListControls } from "./work-package-list-controls";

const allWorkPackageFilters: WorkPackageListFilters = {
  query: "",
  status: "all",
};

describe("WorkPackageListControls", () => {
  it("renders shareable search and readiness filters without preserving selection", () => {
    render(
      <WorkPackageListControls
        filters={{ query: "riser", status: "SHORTAGE" }}
      />,
    );

    const form = screen.getByRole("form", { name: "Filter Work Packages" });
    expect(form).toHaveAttribute("action", "/");
    expect(form).toHaveAttribute("method", "get");
    expect(within(form).getByLabelText("Search Work Packages")).toHaveValue(
      "riser",
    );
    expect(within(form).getByLabelText("Readiness")).toHaveValue("SHORTAGE");
    expect(within(form).getByRole("button", { name: "Apply" })).toBeVisible();
    expect(within(form).getByRole("link", { name: "Reset" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(form.querySelector('[name="workPackage"]')).toBeNull();
  });
});

describe("WorkPackageList", () => {
  it("renders visible column headers and one detail link per Work Package row", () => {
    render(
      <WorkPackageList
        filters={allWorkPackageFilters}
        items={[
          workPackageReadiness("ready", "READY"),
          workPackageReadiness("shortage", "SHORTAGE"),
          workPackageReadiness("unknown", "UNKNOWN"),
        ]}
        totalCount={3}
      />,
    );

    expect(screen.getByText("3 Work Packages")).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Work Packages" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Compare", "Planned", "Work Package", "Solution", "Status"]);

    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(3);
    expect(
      rows.every((row) => within(row).getAllByRole("link").length === 1),
    ).toBe(true);
    expect(screen.getByText("READY")).toBeInTheDocument();
    expect(screen.getByText("SHORTAGE")).toBeInTheDocument();
    expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Select Work Package ready" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Check selected packages" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Work Package shortage/i }),
    ).toHaveAttribute("href", "/work-packages/shortage");

    const firstRow = rows[0]!;
    expect(
      within(firstRow).getByRole("cell", { name: /8 Oct 2026/ }),
    ).toBeVisible();
    expect(firstRow).toHaveTextContent(
      "Ryanfire 0444 · PVC Pipe Ø40mm · Plasterboard Wall · 60/60",
    );
    expect(firstRow).toHaveTextContent("Status");
  });

  it("uses singular count copy for one Work Package", () => {
    render(
      <WorkPackageList
        filters={allWorkPackageFilters}
        items={[workPackageReadiness("ready", "READY")]}
        totalCount={1}
      />,
    );

    expect(screen.getByText("1 Work Package")).toBeInTheDocument();
    expect(screen.queryByText("1 Work Packages")).not.toBeInTheDocument();
  });

  it("preserves selected Work Packages and explains the two-package minimum", () => {
    render(
      <WorkPackageList
        filters={{ query: "package", status: "all" }}
        items={[
          workPackageReadiness("ready", "READY"),
          workPackageReadiness("shortage", "SHORTAGE"),
        ]}
        selectedIds={["shortage"]}
        selectionAttempted
        totalCount={2}
      />,
    );

    expect(
      screen.getByRole("checkbox", { name: "Select Work Package shortage" }),
    ).toBeChecked();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Select at least two Work Packages",
    );
    expect(
      screen.getByRole("link", { name: "Clear selection" }),
    ).toHaveAttribute("href", "/?q=package");
  });

  it("shows an explicit empty state without implying readiness", () => {
    render(
      <WorkPackageList
        filters={allWorkPackageFilters}
        items={[]}
        totalCount={0}
      />,
    );

    expect(screen.getByText("No Work Packages available")).toBeInTheDocument();
    expect(screen.queryByText("READY")).not.toBeInTheDocument();
  });

  it("shows filtered result counts and a resettable no-match state", () => {
    const filters: WorkPackageListFilters = {
      query: "missing",
      status: "UNKNOWN",
    };
    const { rerender } = render(
      <WorkPackageList
        filters={filters}
        items={[workPackageReadiness("unknown", "UNKNOWN")]}
        totalCount={6}
      />,
    );

    expect(screen.getByText("1 of 6 Work Packages")).toBeInTheDocument();

    rerender(<WorkPackageList filters={filters} items={[]} totalCount={6} />);
    expect(
      screen.getByText("No Work Packages match these filters"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reset filters" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

describe("WorkPackageSelectionSummary", () => {
  it("shows aggregate Product demand without assigning the shortage", () => {
    render(
      <WorkPackageSelectionSummary
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
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Selected package readiness" }),
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
  });
});

describe("WorkPackageDetail", () => {
  it("uses breadcrumb navigation and presents the nominated Solution as a primary section", () => {
    const item = workPackageReadiness("ready", "READY");

    render(<WorkPackageDetail item={item} />);

    const breadcrumb = screen.getByRole("navigation", {
      name: "Breadcrumb",
    });
    expect(
      within(breadcrumb).getByRole("link", { name: "Work Packages" }),
    ).toHaveAttribute("href", "/");
    expect(within(breadcrumb).getByText("Work Package ready")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByText("All Work Packages")).not.toBeInTheDocument();

    expect(
      screen.getByRole("region", { name: "Nominated Solution" }),
    ).toBeInTheDocument();

    const solutionSection = screen.getByRole("region", {
      name: "Nominated Solution",
    });
    expect(
      within(solutionSection).getByText("Ryanfire 0444"),
    ).toBeInTheDocument();
    expect(
      within(solutionSection).getByText("V21.2-21SFR00051-98-A"),
    ).toBeInTheDocument();
    expect(within(solutionSection).getByText("Wall")).toBeInTheDocument();
    expect(
      within(solutionSection).getByText("PVC Pipe Ø40mm"),
    ).toBeInTheDocument();
    expect(
      within(solutionSection).getByText("Plasterboard Wall"),
    ).toBeInTheDocument();
    expect(
      within(solutionSection).getByText(
        "FR plasterboard, FR plasterboard wall (1 layer 13mm)",
      ),
    ).toBeInTheDocument();
    expect(within(solutionSection).getByText("60/60")).toBeInTheDocument();
    expect(
      screen.queryByText("Nominated Solution — context only"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/not a compliance or approval decision/i),
    ).not.toBeInTheDocument();
  });

  it("shows specific Product evidence, numeric zero, and unknown evidence", () => {
    const baseItem = workPackageReadiness("detail", "SHORTAGE");
    const detailAssessment: WorkPackageReadiness["assessment"] = {
      status: "SHORTAGE",
      reason: null,
      requirements: [
        {
          requirementId: "requirement-known",
          description: "Wrap four pipe penetrations",
          product: {
            id: "product-known",
            productCode: "PW-050",
            name: "PW-050 Firestop Pipe Wrap",
            canonicalUnit: "roll",
          },
          requiredQuantity: 4,
          availableQuantity: 0,
          missingQuantity: 4,
          inventoryCapturedAt: "2026-10-02T00:00:00Z",
          status: "SHORTAGE",
          reason: "INSUFFICIENT_QUANTITY",
        },
        {
          requirementId: "requirement-unknown",
          description: "Provide unresolved accessory",
          product: null,
          requiredQuantity: null,
          availableQuantity: null,
          missingQuantity: null,
          inventoryCapturedAt: null,
          status: "UNKNOWN",
          reason: "PRODUCT_NOT_MAPPED",
        },
      ],
    };
    const item: WorkPackageReadiness = {
      ...baseItem,
      workPackage: {
        ...baseItem.workPackage,
        name: "Timber floor readiness check",
        plannedDate: "2026-10-09",
      },
      assessment: detailAssessment,
      solutionOptions: baseItem.solutionOptions.map((option) => ({
        ...option,
        assessment: detailAssessment,
      })),
    };

    render(<WorkPackageDetail item={item} />);

    expect(
      screen.getByRole("heading", { name: "Timber floor readiness check" }),
    ).toBeInTheDocument();

    const solutionSection = screen.getByRole("region", {
      name: "Nominated Solution",
    });
    const requirementsSection = screen.getByRole("region", {
      name: "Product Requirements",
    });
    expect(solutionSection.compareDocumentPosition(requirementsSection)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    expect(
      screen.queryByRole("note", {
        name: "Solution to Product Requirements relationship",
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Readiness path")).not.toBeInTheDocument();
    expect(screen.queryByText("Material evidence")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Product Requirements" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("2 Product Requirements"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "At least one required Product has a confirmed shortfall.",
      ),
    ).not.toBeInTheDocument();

    const requirementsTable = within(requirementsSection).getByRole("table", {
      name: "Product Requirements",
    });
    expect(
      within(requirementsTable)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual([
      "Requirement",
      "Product",
      "Required",
      "Available",
      "Missing",
      "Inventory captured",
      "Status",
    ]);

    expect(
      within(solutionSection).getByText("Ryanfire 0444"),
    ).toBeInTheDocument();
    expect(screen.getByText("PW-050")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "PW-050 Firestop Pipe Wrap",
      }),
    ).toHaveAttribute("href", "/products/product-known");

    const knownEvidence = screen
      .getByText("Wrap four pipe penetrations")
      .closest("tr");
    expect(knownEvidence).not.toBeNull();
    expect(knownEvidence).not.toHaveTextContent("Mapped via Ryanfire 0444");
    expect(
      within(knownEvidence!).getByText("Available").parentElement,
    ).toHaveTextContent("0 roll");
    expect(
      within(knownEvidence!).getByText("Missing").parentElement,
    ).toHaveTextContent("4 roll");

    const unknownEvidence = screen
      .getByText("Provide unresolved accessory")
      .closest("tr");
    expect(unknownEvidence).not.toBeNull();
    expect(unknownEvidence).toHaveTextContent(
      "Not mapped to nominated Solution",
    );
    expect(
      within(unknownEvidence!).getByText("Product not mapped"),
    ).toBeInTheDocument();
    expect(within(unknownEvidence!).getAllByText("Unknown")).toHaveLength(6);
  });

  it("omits the redundant Product Requirement count for one item", () => {
    const baseItem = workPackageReadiness("single", "READY");
    const assessment: WorkPackageReadiness["assessment"] = {
      ...baseItem.assessment,
      requirements: [
        {
          requirementId: "requirement-single",
          description: "Install one collar",
          product: {
            id: "product-single",
            productCode: "SC-100",
            name: "SC-100 Fire Collar",
            canonicalUnit: "each",
          },
          requiredQuantity: 1,
          availableQuantity: 10,
          missingQuantity: 0,
          inventoryCapturedAt: "2026-10-02T00:00:00Z",
          status: "READY",
          reason: "SUFFICIENT_QUANTITY",
        },
      ],
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

    expect(screen.queryByText("1 Product Requirement")).not.toBeInTheDocument();
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
