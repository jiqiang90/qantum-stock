"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuthenticatedReadinessService } from "@/modules/readiness/create-readiness-service";
import { parseSelectSolutionCommand } from "@/modules/readiness/readiness-boundaries";

export async function selectSolutionAction(formData: FormData): Promise<void> {
  const command = parseSelectSolutionCommand({
    workPackageId: formData.get("workPackageId"),
    solutionOptionId: formData.get("solutionOptionId"),
    expectedCurrentOptionId: formData.get("expectedCurrentOptionId"),
  });

  if (command === null) {
    redirect("/?selection=invalid");
  }

  const path = `/work-packages/${command.workPackageId}`;
  const service = await createAuthenticatedReadinessService();
  const result = await service.selectSolution(command);

  switch (result.status) {
    case "selected":
      revalidatePath(path);
      redirect(path);
    case "unauthenticated":
      redirect(`/sign-in?next=${encodeURIComponent(path)}`);
    case "conflict":
      redirect(`${path}?selection=conflict`);
    case "invalid":
      redirect(`${path}?selection=invalid`);
    case "unavailable":
      redirect(`${path}?selection=unavailable`);
  }
}
