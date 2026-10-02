"use client";

export default function ErrorState({ retry }: { retry: () => void }) {
  return (
    <section
      aria-labelledby="dependency-error-title"
      className="max-w-2xl rounded-2xl border border-rose-300 bg-rose-50 p-6 sm:p-8"
    >
      <p className="text-xs font-semibold tracking-[0.16em] text-rose-800 uppercase">
        Data unavailable
      </p>
      <h1
        id="dependency-error-title"
        className="mt-2 text-2xl font-semibold text-rose-950"
      >
        Data could not be loaded
      </h1>
      <p className="mt-3 text-sm leading-6 text-rose-900">
        The supporting data is unavailable. Check the data service and try
        again.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 min-h-11 rounded-md bg-rose-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-rose-900"
      >
        Try again
      </button>
    </section>
  );
}
