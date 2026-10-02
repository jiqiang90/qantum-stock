"use client";

import { useState } from "react";

export function CopySummary({ summary }: { readonly summary: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  async function copy(): Promise<void> {
    try {
      if (navigator.clipboard?.writeText === undefined) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(summary);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-slate-300 bg-slate-50 p-4">
      <label className="block text-sm font-semibold text-slate-800">
        Summary preview
        <textarea
          aria-label="Summary preview"
          className="mt-2 min-h-56 w-full resize-y rounded-md border border-slate-400 bg-white p-3 font-mono text-xs leading-5 text-slate-900 outline-none focus-visible:border-emerald-800 focus-visible:ring-3 focus-visible:ring-emerald-700/30"
          readOnly
          value={summary}
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          className="min-h-11 rounded-md bg-emerald-800 px-5 text-sm font-bold text-white outline-none hover:bg-emerald-900 focus-visible:ring-3 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          onClick={copy}
          type="button"
        >
          Copy summary
        </button>
        {copyState === "copied" ? (
          <p className="text-sm font-semibold text-emerald-900" role="status">
            Copied
          </p>
        ) : null}
        {copyState === "failed" ? (
          <p className="text-sm font-semibold text-rose-800" role="alert">
            Clipboard access failed. Select and copy the summary manually.
          </p>
        ) : null}
      </div>
    </div>
  );
}
