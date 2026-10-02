import { z } from "zod";

import type {
  SelectSolutionCommand,
  SelectionFeedback,
  WorkPackageListFilters,
} from "./readiness-model";

export {
  parseSupabaseReadConfig,
  type SupabaseReadConfig,
} from "@/lib/supabase/read-config";

const workPackageIdSchema = z.guid();
const workPackageQuerySchema = z.string().trim().min(1).max(100);
const workPackageStatusSchema = z.enum(["all", "READY", "SHORTAGE", "UNKNOWN"]);
const MAX_SELECTED_WORK_PACKAGES = 20;
const selectSolutionCommandSchema = z.object({
  workPackageId: workPackageIdSchema,
  solutionOptionId: workPackageIdSchema,
  expectedCurrentOptionId: workPackageIdSchema,
});
const selectionFeedbackSchema = z.enum(["conflict", "invalid", "unavailable"]);

type SearchParams = Record<string, string | string[] | undefined>;

export function parseWorkPackageId(value: string): string | null {
  const result = workPackageIdSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseSelectSolutionCommand(
  input: unknown,
): SelectSolutionCommand | null {
  const result = selectSolutionCommandSchema.safeParse(input);
  return result.success ? result.data : null;
}

export function parseSelectionFeedback(value: unknown): SelectionFeedback {
  const result = selectionFeedbackSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseWorkPackageListFilters(
  params: SearchParams,
): WorkPackageListFilters {
  return {
    query: parseOrDefault(workPackageQuerySchema, params.q, ""),
    status: parseOrDefault(workPackageStatusSchema, params.status, "all"),
  };
}

export function parseWorkPackageSelection(params: SearchParams): {
  readonly attempted: boolean;
  readonly ids: readonly string[];
} {
  const attemptedValues = normalizeValues(params.compare);
  const selectedValues = normalizeValues(params.workPackage).slice(
    0,
    MAX_SELECTED_WORK_PACKAGES,
  );
  const ids = new Set<string>();

  for (const value of selectedValues) {
    const parsed = workPackageIdSchema.safeParse(value);
    if (parsed.success) {
      ids.add(parsed.data);
    }
  }

  return {
    attempted: attemptedValues.includes("1"),
    ids: [...ids],
  };
}

function normalizeValues(
  value: string | string[] | undefined,
): readonly string[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function parseOrDefault<T>(
  schema: z.ZodType<T>,
  value: string | string[] | undefined,
  fallback: T,
): T {
  if (typeof value !== "string") {
    return fallback;
  }

  const result = schema.safeParse(value);
  return result.success ? result.data : fallback;
}
