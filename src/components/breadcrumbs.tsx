import Link from "next/link";

export function Breadcrumbs({
  parent,
  current,
}: {
  readonly parent: { readonly href: string; readonly label: string };
  readonly current: string;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-2 text-sm">
        <li>
          <Link
            href={parent.href}
            className="inline-flex min-h-11 items-center rounded-md font-semibold text-emerald-900 underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
          >
            {parent.label}
          </Link>
        </li>
        <li aria-hidden="true" className="text-slate-400">
          /
        </li>
        <li className="min-w-0">
          <span
            aria-current="page"
            title={current}
            className="block max-w-56 truncate font-medium text-slate-600 sm:max-w-xl"
          >
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
