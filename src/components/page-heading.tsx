import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  aside,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly aside?: ReactNode;
}) {
  const layout =
    aside === undefined
      ? "max-w-3xl"
      : "grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-end";

  return (
    <header className={`mb-8 border-b border-slate-300 pb-7 ${layout}`}>
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-800 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
          {description}
        </p>
      </div>
      {aside === undefined ? null : (
        <div className="border-l-4 border-emerald-700 pl-4 text-sm leading-6 text-slate-600">
          {aside}
        </div>
      )}
    </header>
  );
}
