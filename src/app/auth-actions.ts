"use server";

import { redirect } from "next/navigation";

import { createAuthService } from "@/modules/auth/create-auth-service";

export async function signOutAction(): Promise<void> {
  const service = await createAuthService();
  await service.signOut();
  redirect("/");
}
