import Link from "next/link";

import type { AuthActor } from "./auth-service";

interface AuthStatusProps {
  readonly actor: AuthActor | null;
  readonly signOutAction: () => Promise<void> | void;
}

export function AuthStatus({ actor, signOutAction }: AuthStatusProps) {
  if (actor === null) {
    return (
      <Link
        href="/sign-in"
        className="rounded-sm px-3 py-2 text-sm font-semibold text-slate-200 outline-none hover:bg-slate-800 hover:text-white focus-visible:ring-3 focus-visible:ring-emerald-300"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-xs font-semibold tracking-[0.08em] text-slate-300 uppercase sm:inline">
        Demo Team Leader
      </span>
      <form action={signOutAction}>
        <button
          type="submit"
          className="rounded-sm px-3 py-2 text-sm font-semibold text-slate-200 outline-none hover:bg-slate-800 hover:text-white focus-visible:ring-3 focus-visible:ring-emerald-300"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
