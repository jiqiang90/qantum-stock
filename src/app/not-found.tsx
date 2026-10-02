import Link from "next/link";

export default function NotFound() {
  return (
    <section className="max-w-2xl rounded-2xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-slate-600 uppercase">
        Not found
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-950">
        Work Package not found
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        This Work Package does not exist. No readiness result has been inferred.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-slate-950"
      >
        Return to Work Packages
      </Link>
    </section>
  );
}
