"use client";

import { useState } from "react";

import { parseShortageSummaryInput } from "./readiness-boundaries";
import type { WorkPackageReadiness } from "./readiness-model";
import { buildWorkPackageShortageSummary } from "./shortage-summary";
import { CopySummary } from "./copy-summary";

export function WorkPackageShortageSummary({
  item,
}: {
  readonly item: WorkPackageReadiness;
}) {
  const blockingRequirements = item.assessment.requirements.filter(
    ({ status }) => status !== "READY",
  );
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [note, setNote] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (blockingRequirements.length === 0) {
    return null;
  }

  function toggle(requirementId: string, selected: boolean): void {
    setSelectedIds((current) =>
      selected
        ? [...current, requirementId]
        : current.filter((id) => id !== requirementId),
    );
    setSummary(null);
    setError(null);
  }

  function preview(): void {
    const input = parseShortageSummaryInput({
      selectedRequirementIds: selectedIds,
      note,
    });
    if (input === null) {
      setSummary(null);
      setError(
        "Select at least one blocking requirement and keep the note within 500 characters.",
      );
      return;
    }

    setSummary(buildWorkPackageShortageSummary({ item, ...input }));
    setError(null);
  }

  return (
    <section
      aria-labelledby="prepare-shortage-summary-title"
      className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6"
    >
      <p className="text-xs font-semibold tracking-[0.16em] text-emerald-800 uppercase">
        Portable evidence
      </p>
      <h2
        id="prepare-shortage-summary-title"
        className="mt-1 text-xl font-semibold text-slate-950"
      >
        Prepare shortage summary
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Choose the blocking requirements to include. Copying creates no record
        and does not send the summary.
      </p>

      <fieldset className="mt-5 space-y-3">
        <legend className="text-sm font-semibold text-slate-800">
          Blocking requirements
        </legend>
        {blockingRequirements.map((requirement) => (
          <label
            className="flex min-h-11 items-start gap-3 rounded-md border border-slate-300 px-3 py-3 text-sm text-slate-800"
            key={requirement.requirementId}
          >
            <input
              checked={selectedIds.includes(requirement.requirementId)}
              className="mt-0.5 size-5 accent-emerald-800"
              onChange={(event) =>
                toggle(requirement.requirementId, event.currentTarget.checked)
              }
              type="checkbox"
            />
            <span>
              <span className="block font-semibold">
                {requirement.description}
              </span>
              <span className="mt-1 block text-xs text-slate-600">
                {requirement.status} ·{" "}
                {requirement.product?.productCode ?? "Product unknown"}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="mt-5 block text-sm font-semibold text-slate-800">
        Optional note
        <textarea
          aria-label="Optional note"
          className="mt-2 min-h-24 w-full resize-y rounded-md border border-slate-400 bg-white p-3 text-sm text-slate-950 outline-none focus-visible:border-emerald-800 focus-visible:ring-3 focus-visible:ring-emerald-700/30"
          maxLength={500}
          onChange={(event) => {
            setNote(event.currentTarget.value);
            setSummary(null);
            setError(null);
          }}
          value={note}
        />
      </label>

      <button
        className="mt-4 min-h-11 rounded-md border border-emerald-800 px-5 text-sm font-bold text-emerald-900 outline-none hover:bg-emerald-50 focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        onClick={preview}
        type="button"
      >
        Preview summary
      </button>
      {error === null ? null : (
        <p className="mt-3 text-sm font-semibold text-rose-800" role="alert">
          {error}
        </p>
      )}
      {summary === null ? null : <CopySummary summary={summary} />}
    </section>
  );
}
