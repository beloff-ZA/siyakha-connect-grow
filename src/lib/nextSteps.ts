import { supabase } from "@/integrations/supabase/client";

/**
 * One project next-steps list is the single source of truth. Visibility flags
 * decide whether a technician (installation work) and/or the client sees a step.
 * There is deliberately no second next-steps system anywhere.
 */

const db = supabase as unknown as { from: (t: string) => any };

export type NextStepStatus = "pending" | "in_progress" | "done";

export type NextStep = {
  id: string;
  project_id: string;
  title: string;
  detail: string | null;
  category: string;
  status: NextStepStatus;
  due_date: string | null;
  sort_order: number;
  technician_visible: boolean;
  client_visible: boolean;
  completed_at: string | null;
  updated_by_name: string | null;
};

export const STEP_CATEGORIES = [
  { value: "installation", label: "Installation" },
  { value: "client", label: "Client / commercial" },
  { value: "general", label: "General" },
];

export const STEP_STATUSES: { value: NextStepStatus; label: string }[] = [
  { value: "pending", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export const stepStatusLabel = (v: string) => STEP_STATUSES.find((s) => s.value === v)?.label ?? v;

export async function loadNextSteps(projectId: string) {
  const { data, error } = await db
    .from("portal_project_next_steps")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as NextStep[];
}

export type NextStepInput = {
  title: string;
  detail?: string | null;
  category?: string;
  due_date?: string | null;
  technician_visible?: boolean;
  client_visible?: boolean;
  sort_order?: number;
};

export async function createNextStep(projectId: string, input: NextStepInput) {
  const { error } = await db.from("portal_project_next_steps").insert({
    project_id: projectId,
    title: input.title.trim(),
    detail: input.detail?.trim() || null,
    category: input.category ?? "installation",
    due_date: input.due_date || null,
    technician_visible: input.technician_visible ?? true,
    client_visible: input.client_visible ?? true,
    sort_order: input.sort_order ?? 0,
  });
  if (error) throw error;
}

export async function updateNextStep(id: string, patch: Partial<NextStep>) {
  const { error } = await db.from("portal_project_next_steps").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteNextStep(id: string) {
  const { error } = await db.from("portal_project_next_steps").delete().eq("id", id);
  if (error) throw error;
}

/** Turns one-per-line text captured at project creation into ordered steps. */
export const parseStepLines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.replace(/^[\s\-•*\d.)]+/, "").trim())
    .filter((l) => l.length > 0)
    .slice(0, 40);

export async function seedNextSteps(projectId: string, lines: string[], category = "installation") {
  if (!lines.length) return;
  const { error } = await db.from("portal_project_next_steps").insert(
    lines.map((title, i) => ({
      project_id: projectId,
      title: title.slice(0, 240),
      category,
      sort_order: i + 1,
    })),
  );
  if (error) throw error;
}
