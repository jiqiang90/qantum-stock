import Link from "next/link";
import { redirect } from "next/navigation";

import { parseSignInNextPath } from "@/modules/auth/auth-boundaries";
import { createAuthService } from "@/modules/auth/create-auth-service";
import { SignInForm } from "@/modules/auth/sign-in-form";

import { signInAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  readonly searchParams: Promise<{
    readonly next?: string | readonly string[];
  }>;
}) {
  const params = await searchParams;
  const nextPath = parseSignInNextPath(params.next);
  const service = await createAuthService();

  if ((await service.currentActor()) !== null) {
    redirect(nextPath);
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="text-xs font-bold tracking-[0.14em] text-emerald-800 uppercase">
        Demo Team Leader
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
        Sign in
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Sign in to change the nominated Solution. Read-only evidence remains
        public.
      </p>

      <div className="mt-8 rounded-xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
        <SignInForm action={signInAction} nextPath={nextPath} />
      </div>

      <Link
        href={nextPath}
        className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-emerald-800 underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-emerald-300"
      >
        Continue without signing in
      </Link>
    </div>
  );
}
