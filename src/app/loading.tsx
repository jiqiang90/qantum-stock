export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-pulse motion-reduce:animate-none"
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-slate-600 uppercase">
        Loading data
      </p>
      <div className="mt-4 h-12 max-w-xl rounded bg-slate-300" />
      <div className="mt-10 space-y-4">
        <div className="h-32 rounded-2xl border border-slate-300 bg-white" />
        <div className="h-32 rounded-2xl border border-slate-300 bg-white" />
      </div>
      <span className="sr-only">Page data is loading.</span>
    </div>
  );
}
