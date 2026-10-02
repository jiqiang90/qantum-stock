"use client";

import { useState } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatPlannedDate, ReadinessStatusBadge } from "./readiness-display";
import type {
  SelectionFeedback,
  WorkPackageReadiness,
} from "./readiness-model";
import { WorkPackageRequirementsSection } from "./work-package-requirements-section";
import { WorkPackageShortageSummary } from "./work-package-shortage-summary";
import {
  type SelectSolutionAction,
  WorkPackageSolutionSection,
} from "./work-package-solution-section";

export function WorkPackageDetail({
  item: { workPackage, solutionOptions },
  canChangeSolution = false,
  selectSolutionAction,
  selectionFeedback = null,
}: {
  readonly item: WorkPackageReadiness;
  readonly canChangeSolution?: boolean;
  readonly selectSolutionAction?: SelectSolutionAction;
  readonly selectionFeedback?: SelectionFeedback;
}) {
  const [previewOptionId, setPreviewOptionId] = useState(
    workPackage.selectedSolutionOptionId,
  );
  const previewOption =
    solutionOptions.find(({ option }) => option.id === previewOptionId) ??
    solutionOptions.find(({ selected }) => selected)!;

  return (
    <article>
      <header>
        <Breadcrumbs
          parent={{ href: "/", label: "Work Packages" }}
          current={workPackage.name}
        />

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-600 uppercase">
              Planned {formatPlannedDate(workPackage.plannedDate)}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {workPackage.name}
            </h1>
          </div>
          <output aria-label="Preview readiness" role="status">
            <ReadinessStatusBadge status={previewOption.assessment.status} />
          </output>
        </div>
      </header>

      <div className="mt-9 space-y-5">
        <SelectionFeedbackMessage feedback={selectionFeedback} />

        <WorkPackageSolutionSection
          workPackageId={workPackage.id}
          selectedOptionId={workPackage.selectedSolutionOptionId}
          previewOption={previewOption}
          options={solutionOptions}
          canChangeSolution={canChangeSolution}
          selectSolutionAction={selectSolutionAction}
          onPreview={setPreviewOptionId}
        />

        <WorkPackageRequirementsSection assessment={previewOption.assessment} />

        <WorkPackageShortageSummary
          key={previewOption.option.id}
          item={{
            workPackage,
            selectedOption: previewOption.option,
            assessment: previewOption.assessment,
            solutionOptions,
          }}
        />
      </div>
    </article>
  );
}

function SelectionFeedbackMessage({
  feedback,
}: {
  readonly feedback: SelectionFeedback;
}) {
  if (feedback === null) {
    return null;
  }

  const message = {
    conflict:
      "The selected Solution changed elsewhere. Review current evidence and try again.",
    invalid: "That Solution Option is not available for this Work Package.",
    unavailable:
      "We couldn't confirm the selected Solution update. Reload current evidence before trying again.",
  }[feedback];

  return (
    <p
      role="alert"
      className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950"
    >
      {message}
    </p>
  );
}
