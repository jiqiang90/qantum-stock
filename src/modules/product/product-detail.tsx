import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import type { ProductDetailTab } from "./product-boundaries";
import type { ProductEvidence } from "./product-model";
import { ProductUsageList } from "./product-usage-list";

export function ProductDetail({
  product,
  activeTab = "details",
}: {
  readonly product: ProductEvidence;
  readonly activeTab?: ProductDetailTab;
}) {
  const workPackageCount = new Set(
    product.usages.map((usage) => usage.workPackage.id),
  ).size;

  return (
    <>
      <header>
        <Breadcrumbs
          parent={{ href: "/products", label: "Products" }}
          current={product.name}
        />

        <div className="mt-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-emerald-800 uppercase">
            {product.productCode}
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {product.name}
          </h1>
        </div>
      </header>

      <ProductSectionNavigation
        activeTab={activeTab}
        productId={product.id}
        usageCount={workPackageCount}
      />

      {activeTab === "details" ? (
        <ProductDetailsPanel product={product} />
      ) : (
        <ProductUsageList
          inventorySnapshot={product.inventorySnapshot}
          unit={product.canonicalUnit}
          usages={product.usages}
        />
      )}
    </>
  );
}

function ProductSectionNavigation({
  activeTab,
  productId,
  usageCount,
}: {
  readonly activeTab: ProductDetailTab;
  readonly productId: string;
  readonly usageCount: number;
}) {
  return (
    <nav
      aria-label="Product sections"
      className="mt-8 border-b border-slate-300"
    >
      <div className="flex gap-1 overflow-x-auto">
        <SectionLink
          active={activeTab === "details"}
          href={`/products/${productId}`}
        >
          Product details
        </SectionLink>
        <SectionLink
          active={activeTab === "usage"}
          href={`/products/${productId}?tab=usage`}
        >
          Work Package usage ({usageCount})
        </SectionLink>
      </div>
    </nav>
  );
}

function SectionLink({
  active,
  children,
  href,
}: {
  readonly active: boolean;
  readonly children: React.ReactNode;
  readonly href: string;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      href={href}
      className={`relative inline-flex min-h-12 shrink-0 items-center rounded-t-md px-4 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
        active
          ? "bg-white text-slate-950 after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-emerald-600"
          : "text-slate-600 hover:bg-white/70 hover:text-emerald-900"
      }`}
    >
      {children}
    </Link>
  );
}

function ProductDetailsPanel({
  product,
}: {
  readonly product: ProductEvidence;
}) {
  return (
    <section aria-labelledby="product-details-title" className="pt-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-slate-600 uppercase">
        Product information
      </p>
      <h2
        id="product-details-title"
        className="mt-1 text-2xl font-semibold text-slate-950"
      >
        Product details
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
        {product.description}
      </p>

      <dl className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-slate-300 bg-slate-200 shadow-sm sm:grid-cols-2">
        <ProductAttribute label="Category" value={product.category} />
        <ProductAttribute label="Variant" value={product.variant} />
        <ProductAttribute label="Manufacturer" value={product.manufacturer} />
        <ProductAttribute
          label="Supplier Product Code"
          value={product.supplierProductCode}
        />
        <ProductAttribute
          label="Canonical unit"
          value={product.canonicalUnit}
          wide
        />
      </dl>
    </section>
  );
}

function ProductAttribute({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`bg-white p-5 sm:min-h-28 sm:p-6 ${wide ? "sm:col-span-2" : ""}`}
    >
      <dt className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="mt-2 text-base leading-6 font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  );
}
