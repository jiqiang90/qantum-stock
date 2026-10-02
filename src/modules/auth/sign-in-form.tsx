"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export interface SignInActionState {
  readonly status: "idle" | "invalid" | "error";
  readonly message?: string;
  readonly fieldErrors?: Partial<
    Record<"email" | "password", readonly string[]>
  >;
  readonly email?: string;
}

export type SignInAction = (
  previousState: SignInActionState,
  formData: FormData,
) => Promise<SignInActionState>;

const idleState: SignInActionState = { status: "idle" };

interface SignInFormProps {
  readonly action: SignInAction;
  readonly nextPath: string;
  readonly initialState?: SignInActionState;
}

export function SignInForm({
  action,
  nextPath,
  initialState = idleState,
}: SignInFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="nextPath" value={nextPath} />

      {state.message ? (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-bold text-slate-800"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email ?? ""}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "email-error" : undefined}
          className="mt-2 min-h-12 w-full rounded-md border border-slate-400 bg-white px-4 text-base outline-none focus:border-emerald-700 focus:ring-3 focus:ring-emerald-200"
        />
        {emailError ? (
          <p id="email-error" className="mt-2 text-sm text-red-800">
            {emailError}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-bold text-slate-800"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={passwordError ? "password-error" : undefined}
          className="mt-2 min-h-12 w-full rounded-md border border-slate-400 bg-white px-4 text-base outline-none focus:border-emerald-700 focus:ring-3 focus:ring-emerald-200"
        />
        {passwordError ? (
          <p id="password-error" className="mt-2 text-sm text-red-800">
            {passwordError}
          </p>
        ) : null}
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 w-full rounded-md bg-emerald-800 px-5 py-3 text-sm font-bold text-white outline-none hover:bg-emerald-900 focus-visible:ring-3 focus-visible:ring-emerald-300 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
