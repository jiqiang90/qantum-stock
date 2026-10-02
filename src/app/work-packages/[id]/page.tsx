import { notFound } from "next/navigation";

import { createReadinessService } from "@/modules/readiness/create-readiness-service";
import { parseWorkPackageId } from "@/modules/readiness/readiness-boundaries";
import { WorkPackageDetail } from "@/modules/readiness/work-package-detail";

export const dynamic = "force-dynamic";

export default async function WorkPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: routeId } = await params;
  const id = parseWorkPackageId(routeId);

  if (id === null) {
    notFound();
  }

  const readiness = createReadinessService();
  const item = await readiness.findById(id);

  if (item === null) {
    notFound();
  }

  return <WorkPackageDetail item={item} />;
}
