"use server";

import { redirect } from "next/navigation";

import { createAuthService } from "@/modules/auth/create-auth-service";
import type { SignInActionState } from "@/modules/auth/sign-in-form";

export async function signInAction(
  _previousState: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  const email = formData.get("email");
  const service = await createAuthService();
  const result = await service.signIn({
    email,
    password: formData.get("password"),
    nextPath: formData.get("nextPath"),
  });

  if (result.status === "success") {
    redirect(result.nextPath);
  }

  return {
    ...result,
    email: typeof email === "string" ? email : "",
  };
}
