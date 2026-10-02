import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  tone = "neutral",
}: {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  readonly tone?: "neutral" | "warning";
}) {
  const classes =
    tone === "warning"
      ? "border-amber-300 bg-amber-50"
      : "border-slate-300 bg-white shadow-sm";

  return (
    <section className={`rounded-2xl border p-8 ${classes}`}>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {description}
      </p>
      {action === undefined ? null : <div className="mt-5">{action}</div>}
    </section>
  );
}
