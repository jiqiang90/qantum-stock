"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { ReadinessStatusBadge } from "./readiness-display";
import type {
  SolutionOptionReadiness,
  SolutionReference,
} from "./readiness-model";
import { formatFireResistance } from "./solution-display";

export type SelectSolutionAction = (formData: FormData) => Promise<void> | void;

interface WorkPackageSolutionSectionProps {
  readonly workPackageId: string;
  readonly selectedOptionId: string;
  readonly previewOption: SolutionOptionReadiness;
  readonly options: readonly SolutionOptionReadiness[];
  readonly canChangeSolution: boolean;
  readonly selectSolutionAction?: SelectSolutionAction;
  readonly onPreview: (optionId: string) => void;
}

export function WorkPackageSolutionSection({
  workPackageId,
  selectedOptionId,
  previewOption,
  options,
  canChangeSolution,
  selectSolutionAction,
  onPreview,
}: WorkPackageSolutionSectionProps) {
  const solution = previewOption.option.solution;
  const previewIsSelected = previewOption.option.id === selectedOptionId;

  return (
    <section
      aria-labelledby="nominated-solution-title"
      className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.16em] text-emerald-800 uppercase">
          {previewIsSelected ? "Selected Solution" : "Alternative preview"}
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

      <fieldset className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <legend className="text-sm font-bold text-slate-950">
          Eligible Solution Options
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {options.map((candidate) => {
            const candidateSolution = candidate.option.solution;
            const selected = candidate.option.id === selectedOptionId;

            return (
              <label
                key={candidate.option.id}
                className={`flex min-h-24 cursor-pointer gap-3 rounded-lg border p-4 outline-none has-focus-visible:ring-3 has-focus-visible:ring-emerald-300 ${
                  candidate.option.id === previewOption.option.id
                    ? "border-emerald-700 bg-emerald-50"
                    : "border-slate-300 bg-white hover:border-slate-500"
                }`}
              >
                <input
                  type="radio"
                  name="previewSolutionOption"
                  value={candidate.option.id}
                  checked={candidate.option.id === previewOption.option.id}
                  onChange={() => onPreview(candidate.option.id)}
                  aria-label={`${candidateSolution.supplier} ${candidateSolution.internalCode}, ${candidate.assessment.status}${selected ? ", selected" : ""}`}
                  className="mt-1 size-5 shrink-0 accent-emerald-800"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-bold text-slate-950">
                      {candidateSolution.internalCode}
                    </span>
                    <ReadinessStatusBadge
                      status={candidate.assessment.status}
                    />
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-slate-700">
                    {candidateSolution.serviceTypeOption}
                  </span>
                  {selected ? (
                    <span className="mt-2 block text-xs font-bold text-emerald-800">
                      Current selection
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <SolutionDetails solution={solution} />

      <div className="border-t border-slate-200 px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Selecting a Solution changes the material plan. It does not reserve
          stock.
        </p>
        <div className="mt-4 shrink-0 sm:mt-0">
          {canChangeSolution && selectSolutionAction ? (
            <form action={selectSolutionAction} aria-label="Select Solution">
              <input type="hidden" name="workPackageId" value={workPackageId} />
              <input
                type="hidden"
                name="solutionOptionId"
                value={previewOption.option.id}
              />
              <input
                type="hidden"
                name="expectedCurrentOptionId"
                value={selectedOptionId}
              />
              <SelectionSubmitButton previewIsSelected={previewIsSelected} />
            </form>
          ) : previewIsSelected ? null : (
            <Link
              href={`/sign-in?next=${encodeURIComponent(`/work-packages/${workPackageId}`)}`}
              className="inline-flex min-h-11 items-center rounded-md bg-emerald-800 px-5 text-sm font-bold text-white outline-none hover:bg-emerald-900 focus-visible:ring-3 focus-visible:ring-emerald-300"
            >
              Sign in to update Solution
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function SelectionSubmitButton({
  previewIsSelected,
}: {
  readonly previewIsSelected: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={previewIsSelected || pending}
      className="min-h-11 rounded-md bg-emerald-800 px-5 text-sm font-bold text-white outline-none hover:bg-emerald-900 focus-visible:ring-3 focus-visible:ring-emerald-300 disabled:cursor-default disabled:bg-slate-300 disabled:text-slate-600"
    >
      {pending
        ? "Saving selection…"
        : previewIsSelected
          ? "Current Solution"
          : "Use this Solution"}
    </button>
  );
}

function SolutionDetails({
  solution,
}: {
  readonly solution: SolutionReference;
}) {
  return (
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
