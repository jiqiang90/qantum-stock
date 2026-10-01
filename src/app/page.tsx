export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
      <section aria-labelledby="page-title" className="max-w-2xl space-y-5">
        <p className="text-sm font-semibold tracking-[0.18em] text-emerald-800 uppercase">
          Team leader workspace
        </p>
        <h1
          id="page-title"
          className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl"
        >
          Material readiness
        </h1>
        <p className="text-lg leading-8 text-slate-700">
          The project foundation is ready. The first business slice will help
          team leaders check planned work and prepare a clear shortage summary
          before travelling to site.
        </p>
      </section>
    </main>
  );
}
