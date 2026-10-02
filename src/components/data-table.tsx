import type { ReactNode } from "react";

export function DataTable({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
      <table aria-label={label} className="w-full table-fixed">
        {children}
      </table>
    </div>
  );
}

export function DataTableHead({ children }: { readonly children: ReactNode }) {
  return (
    <thead className="hidden bg-slate-100 lg:table-header-group">
      <tr className="text-left">{children}</tr>
    </thead>
  );
}

export function DataTableHeaderCell({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <th
      scope="col"
      className="px-5 py-3 text-xs font-semibold tracking-[0.08em] text-slate-600 uppercase"
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { readonly children: ReactNode }) {
  return (
    <tbody className="block divide-y divide-slate-200 lg:table-row-group">
      {children}
    </tbody>
  );
}

export function DataTableRow({
  children,
  interactive = true,
}: {
  readonly children: ReactNode;
  readonly interactive?: boolean;
}) {
  return (
    <tr
      className={`group relative block py-3 lg:table-row lg:py-0 ${
        interactive ? "cursor-pointer hover:bg-slate-50" : ""
      }`}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({
  label,
  children,
  emphasis = false,
}: {
  readonly label: string;
  readonly children: ReactNode;
  readonly emphasis?: boolean;
}) {
  return (
    <td className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-3 px-5 py-2 align-middle text-sm lg:table-cell lg:px-5 lg:py-5">
      <span className="text-xs font-semibold tracking-[0.08em] text-slate-600 uppercase lg:hidden">
        {label}
      </span>
      <span
        className={
          emphasis
            ? "min-w-0 font-semibold text-slate-950"
            : "min-w-0 font-medium text-slate-800"
        }
      >
        {children}
      </span>
    </td>
  );
}
