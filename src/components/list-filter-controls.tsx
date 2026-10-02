import Link from "next/link";
import type { ReactNode } from "react";

const controlClassName =
  "min-h-11 w-full rounded-md border border-slate-400 bg-white px-3 text-sm text-slate-950 outline-none focus-visible:border-emerald-800 focus-visible:ring-3 focus-visible:ring-emerald-700/30";

export function ListSearchField({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  readonly label: string;
  readonly name: string;
  readonly defaultValue: string;
  readonly placeholder: string;
}) {
  return (
    <label className="text-sm font-semibold text-slate-800">
      {label}
      <input
        className={`mt-2 ${controlClassName}`}
        defaultValue={defaultValue}
        maxLength={100}
        name={name}
        placeholder={placeholder}
        type="search"
      />
    </label>
  );
}

export function ListFilterSelect({
  label,
  name,
  value,
  children,
}: {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly children: ReactNode;
}) {
  return (
    <label className="text-sm font-semibold text-slate-800">
      {label}
      <span className="relative mt-2 block">
        <select
          className={`${controlClassName} appearance-none pr-10`}
          defaultValue={value}
          name={name}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-700"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="m5 7.5 5 5 5-5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
        </svg>
      </span>
    </label>
  );
}

export function ListFilterActions({
  resetHref,
}: {
  readonly resetHref: string;
}) {
  return (
    <div className="flex min-h-11 items-center gap-2 self-end sm:col-span-2 sm:w-full sm:justify-end sm:border-t sm:border-slate-200 sm:pt-4 lg:col-span-1 lg:w-auto lg:justify-start lg:border-t-0 lg:pt-0">
      <button
        className="min-h-11 rounded-md bg-emerald-800 px-5 text-sm font-bold text-white outline-none hover:bg-emerald-900 focus-visible:ring-3 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        type="submit"
      >
        Apply
      </button>
      <Link
        className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-emerald-900 underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        href={resetHref}
      >
        Reset
      </Link>
    </div>
  );
}
