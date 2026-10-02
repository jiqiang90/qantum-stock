import type { ReactNode } from "react";

import type { SolutionReference } from "./readiness-model";
import { formatFireResistance } from "./solution-display";

export function WorkPackageSolutionSection({
  solution,
}: {
  readonly solution: SolutionReference;
}) {
  return (
    <section
      aria-labelledby="nominated-solution-title"
      className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.16em] text-emerald-800 uppercase">
          Solution context
        </p>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h2
            id="nominated-solution-title"
            className="text-2xl font-semibold text-slate-950"
          >
            Nominated Solution
          </h2>
          <p className="text-sm font-semibold text-slate-700">
            {solution.supplier} {solution.internalCode}
          </p>
        </div>
      </div>

      <dl className="grid gap-x-8 gap-y-5 px-5 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        <SolutionValue
          label="Supplier reference"
          value={solution.supplierRefCode}
        />
        <SolutionValue label="Orientation" value={solution.orientation} />
        <SolutionValue
          label="Fire resistance"
          value={formatFireResistance(solution)}
        />
        <SolutionValue
          label="Service"
          value={`${solution.serviceType} ${solution.serviceSize}`}
        />
        <SolutionValue label="Substrate" value={solution.substrateOption} />
        <SolutionValue label="Source substrate" value={solution.substrate} />
      </dl>
    </section>
  );
}

function SolutionValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-6 font-medium text-slate-950">
        {value}
      </dd>
    </div>
  );
}
