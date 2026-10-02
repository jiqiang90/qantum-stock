import { notFound } from "next/navigation";

import { createAuthService } from "@/modules/auth/create-auth-service";
import { createReadinessService } from "@/modules/readiness/create-readiness-service";
import {
  parseSelectionFeedback,
  parseWorkPackageId,
} from "@/modules/readiness/readiness-boundaries";
import { WorkPackageDetail } from "@/modules/readiness/work-package-detail";

import { selectSolutionAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function WorkPackagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ selection?: string | string[] }>;
}) {
  const { id: routeId } = await params;
  const query = await searchParams;
  const id = parseWorkPackageId(routeId);

  if (id === null) {
    notFound();
  }

  const readiness = createReadinessService();
  const item = await readiness.findById(id);

  if (item === null) {
    notFound();
  }

  const actor = await (await createAuthService()).currentActor();

  return (
    <WorkPackageDetail
      item={item}
      canChangeSolution={actor !== null}
      selectSolutionAction={selectSolutionAction}
      selectionFeedback={parseSelectionFeedback(query.selection)}
    />
  );
}
