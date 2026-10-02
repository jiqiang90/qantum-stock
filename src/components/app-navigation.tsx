"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const destinations = [
  { href: "/", label: "Work Packages" },
  { href: "/products", label: "Products" },
] as const;

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="border-t border-slate-700">
      <ul className="mx-auto flex max-w-6xl gap-1 px-5 sm:px-8">
        {destinations.map(({ href, label }) => {
          const current =
            href === "/" ? pathname === href : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center border-b-3 px-3 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-emerald-300 focus-visible:ring-inset ${
                  current
                    ? "border-emerald-400 text-white"
                    : "border-transparent text-slate-300 hover:border-slate-500 hover:text-white"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
