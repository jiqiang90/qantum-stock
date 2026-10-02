import type { Metadata } from "next";

import { AppNavigation } from "@/components/app-navigation";
import { AuthStatus } from "@/modules/auth/auth-status";
import { createAuthService } from "@/modules/auth/create-auth-service";

import { signOutAction } from "./auth-actions";

import "./globals.css";

export const metadata: Metadata = {
  title: "Material Readiness",
  description: "Pre-site material readiness for passive fire team leaders.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const actor = await (await createAuthService()).currentActor();

  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-slate-950 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to main content
        </a>

        <header className="border-b border-slate-300 bg-slate-950 text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-sm bg-emerald-400 text-sm font-black text-slate-950"
              >
                PF
              </span>
              <div>
                <p className="text-sm font-bold tracking-[0.12em] uppercase">
                  Passivefire
                </p>
                <p className="text-xs text-slate-300">Field readiness</p>
              </div>
            </div>
            <AuthStatus actor={actor} signOutAction={signOutAction} />
          </div>
          <AppNavigation />
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
