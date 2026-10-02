import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppNavigation } from "@/components/app-navigation";
import type {
  ProductEvidence,
  ProductListFilters,
  ProductListItem,
} from "./product-model";
import { ProductDetail } from "./product-detail";
import { ProductList } from "./product-list";
import { ProductListControls } from "./product-list-controls";
import { ProductUsageList } from "./product-usage-list";

vi.mock("next/navigation", () => ({
  usePathname: () => "/products",
}));

const allFilters: ProductListFilters = {
  query: "",
  usage: "all",
  inventory: "all",
};

function listItem(index: number): ProductListItem {
  return {
    id: `product-${index}`,
    productCode: `P-${index}`,
    name: `Product ${index}`,
    canonicalUnit: "each",
    inventorySnapshot: {
      availableQuantity: index,
      capturedAt: "2026-10-02T00:00:00Z",
    },
    referencingWorkPackageCount: index,
  };
}

describe("AppNavigation", () => {
  it("links to both work areas and identifies the current one", () => {
    render(<AppNavigation />);

    expect(screen.getByRole("link", { name: "Work Packages" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute(
      "href",
      "/products",
    );
    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});

describe("ProductListControls", () => {
  it("renders a semantic GET form with named URL controls and reset", () => {
    const { container } = render(
      <ProductListControls
        filters={{ query: "collar", usage: "used", inventory: "known" }}
      />,
    );

    const form = screen.getByRole("form", { name: "Filter Products" });
    expect(form).toHaveAttribute("method", "get");
    expect(within(form).getByLabelText("Search Products")).toHaveAttribute(
      "name",
      "q",
    );
    expect(within(form).getByLabelText("Usage")).toHaveValue("used");
    expect(within(form).getByLabelText("Inventory evidence")).toHaveValue(
      "known",
    );
    for (const select of within(form).getAllByRole("combobox")) {
      expect(select).toHaveClass("appearance-none", "pr-10");
    }
    expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(
      2,
    );
    expect(within(form).getByRole("link", { name: "Reset" })).toHaveAttribute(
      "href",
      "/products",
    );

    const actions = within(form).getByRole("button", {
      name: "Apply",
    }).parentElement;
    expect(actions).toHaveClass(
      "items-center",
      "self-end",
      "sm:col-span-2",
      "sm:justify-end",
      "sm:border-t",
      "lg:col-span-1",
      "lg:justify-start",
      "lg:border-t-0",
    );
    expect(actions).not.toHaveClass("items-stretch");
  });
});

describe("ProductList", () => {
  it("renders visible column headers and one Product link per result row", () => {
    render(
      <ProductList
        filters={allFilters}
        items={[1, 2, 3, 4, 5, 6].map(listItem)}
      />,
    );

    expect(screen.getByText("6 Products")).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Products" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual([
      "Product",
      "Product Code",
      "Unit",
      "Latest Inventory",
      "Captured",
      "Used by",
    ]);

    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(6);
    expect(
      rows.every((row) => within(row).getAllByRole("link").length === 1),
    ).toBe(true);
    expect(screen.getByRole("link", { name: /Product 3/i })).toHaveAttribute(
      "href",
      "/products/product-3",
    );

    const firstRow = rows[0]!;
    expect(within(firstRow).getByRole("cell", { name: /P-1/ })).toBeVisible();
    expect(firstRow).toHaveTextContent("Unit");
    expect(firstRow).toHaveTextContent("Captured");
    expect(firstRow).toHaveTextContent("2 Oct 2026, 1:00 pm NZDT");
  });

  it("uses singular count copy for one Product", () => {
    render(<ProductList filters={allFilters} items={[listItem(1)]} />);

    expect(screen.getByText("1 Product")).toBeInTheDocument();
    expect(screen.queryByText("1 Products")).not.toBeInTheDocument();
  });

  it("distinguishes numeric zero from unknown Inventory evidence", () => {
    render(
      <ProductList
        filters={allFilters}
        items={[
          {
            ...listItem(0),
            inventorySnapshot: { ...listItem(0).inventorySnapshot! },
          },
          { ...listItem(1), inventorySnapshot: null },
        ]}
      />,
    );

    const known = screen.getByText("Product 0").closest("tr");
    const unknown = screen.getByText("Product 1").closest("tr");
    expect(known).toHaveTextContent("0");
    expect(known).toHaveTextContent("each");
    expect(known).not.toHaveTextContent("Unknown");
    expect(unknown).toHaveTextContent("Unknown");
  });

  it("shows a filtered-empty recovery action", () => {
    render(
      <ProductList
        filters={{ query: "missing", usage: "unused", inventory: "unknown" }}
        items={[]}
      />,
    );

    expect(
      screen.getByText("No Products match these filters"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
      "href",
      "/products",
    );
  });
});

describe("Product detail evidence", () => {
  const product: ProductEvidence & {
    readonly category: string;
    readonly description: string;
    readonly manufacturer: string;
    readonly supplierProductCode: string;
    readonly variant: string;
  } = {
    id: "product-detail",
    productCode: "PW-050",
    name: "PW-050 Firestop Pipe Wrap",
    canonicalUnit: "roll",
    category: "Pipe wrap",
    description: "Flexible wrap for combustible service penetrations.",
    manufacturer: "Northstar Passive Systems",
    supplierProductCode: "NPS-PW050",
    variant: "50 mm × 10 m roll",
    inventorySnapshot: {
      availableQuantity: 0,
      capturedAt: "2026-10-02T00:00:00Z",
    },
    usages: [
      {
        requirementId: "requirement-one",
        position: 1,
        description: "Wrap pipe penetration",
        requiredQuantity: 4,
        workPackage: {
          id: "work-package-one",
          name: "Timber floor readiness check",
          plannedDate: "2026-10-09",
        },
      },
      {
        requirementId: "requirement-two",
        position: 2,
        description: "Wrap second pipe penetration",
        requiredQuantity: null,
        workPackage: {
          id: "work-package-one",
          name: "Timber floor readiness check",
          plannedDate: "2026-10-09",
        },
      },
    ],
  };

  it("uses breadcrumb navigation instead of a back-link label", () => {
    render(<ProductDetail product={product} />);

    const breadcrumb = screen.getByRole("navigation", {
      name: "Breadcrumb",
    });
    expect(
      within(breadcrumb).getByRole("link", { name: "Products" }),
    ).toHaveAttribute("href", "/products");
    expect(within(breadcrumb).getByText(product.name)).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByText("All Products")).not.toBeInTheDocument();
  });

  it("defaults to Product details and keeps Work Package usage secondary", () => {
    render(<ProductDetail product={product} />);

    const sections = screen.getByRole("navigation", {
      name: "Product sections",
    });
    expect(
      within(sections).getByRole("link", { name: "Product details" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(sections).getByRole("link", { name: "Work Package usage (2)" }),
    ).toHaveAttribute("href", "/products/product-detail?tab=usage");
    expect(
      screen.getByRole("heading", { name: "Product details" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Used in Work Packages" }),
    ).not.toBeInTheDocument();
  });

  it("shows Work Package usage only when that section is selected", () => {
    render(<ProductDetail product={product} activeTab="usage" />);

    const sections = screen.getByRole("navigation", {
      name: "Product sections",
    });
    expect(
      within(sections).getByRole("link", { name: "Work Package usage (2)" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(sections).getByRole("link", { name: "Product details" }),
    ).not.toHaveAttribute("aria-current");
    expect(
      screen.getByRole("heading", { name: "Used in Work Packages" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Product details" }),
    ).not.toBeInTheDocument();
  });

  it("shows Product identity and known zero Inventory evidence", () => {
    render(<ProductDetail product={product} />);

    expect(
      screen.getByRole("heading", { name: product.name }),
    ).toBeInTheDocument();
    expect(screen.getByText("PW-050")).toBeInTheDocument();
    expect(screen.getByText("0 roll")).toBeInTheDocument();
    expect(
      screen.getByText("About Inventory evidence").closest("details"),
    ).not.toHaveAttribute("open");
  });

  it("shows Product-owned catalogue attributes in Product details", () => {
    render(<ProductDetail product={product} />);

    expect(screen.getByText(product.description)).toBeInTheDocument();
    expect(screen.getByText("Pipe wrap")).toBeInTheDocument();
    expect(screen.getByText("Northstar Passive Systems")).toBeInTheDocument();
    expect(screen.getByText("NPS-PW050")).toBeInTheDocument();
    expect(screen.getByText("50 mm × 10 m roll")).toBeInTheDocument();
  });

  it("shows unknown Inventory evidence without implying zero", () => {
    render(<ProductDetail product={{ ...product, inventorySnapshot: null }} />);

    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.queryByText("0 roll")).not.toBeInTheDocument();
  });

  it("shows every requirement and links each usage to its Work Package", () => {
    render(
      <ProductUsageList unit={product.canonicalUnit} usages={product.usages} />,
    );

    expect(screen.getByText("2 Product Requirements")).toBeInTheDocument();
    expect(screen.getByText("Wrap pipe penetration")).toBeInTheDocument();
    expect(
      screen.getByText("Wrap second pipe penetration"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Timber floor readiness check" }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: "Timber floor readiness check" })[0],
    ).toHaveAttribute("href", "/work-packages/work-package-one");
    expect(screen.getAllByText("9 Oct 2026")).toHaveLength(2);
    expect(screen.queryByText("10 Oct 2026")).not.toBeInTheDocument();
  });

  it("uses singular requirement copy for one usage", () => {
    render(
      <ProductUsageList
        unit={product.canonicalUnit}
        usages={[product.usages[0]!]}
      />,
    );

    expect(screen.getByText("1 Product Requirement")).toBeInTheDocument();
    expect(
      screen.queryByText("1 Product Requirements"),
    ).not.toBeInTheDocument();
  });

  it("shows an explicit no-usage state", () => {
    render(<ProductUsageList unit="each" usages={[]} />);

    expect(
      screen.getByText("No Work Packages reference this Product"),
    ).toBeInTheDocument();
  });
});
