/** Commercial deal pipeline — backed by the existing director_projects table. */

export type Deal = {
  id: string;
  user_id: string | null;
  title: string;
  client: string | null;
  status: string;
  priority: string;
  estimated_value: number;
  start_date: string | null;
  due_date: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  site_name: string | null;
  deal_source: string | null;
  probability_percent: number | null;
  next_action: string | null;
  next_action_date: string | null;
  assigned_to: string | null;
  portal_client_id: string | null;
  portal_project_id: string | null;
  won_at: string | null;
  lost_reason: string | null;
};

/** Canonical deal stages. */
export const DEAL_STAGES = [
  { value: "new_lead", label: "New lead", probability: 10 },
  { value: "qualified", label: "Qualified", probability: 25 },
  { value: "site_survey", label: "Site survey", probability: 40 },
  { value: "costing", label: "Costing", probability: 55 },
  { value: "proposal", label: "Proposal", probability: 70 },
  { value: "negotiation", label: "Negotiation", probability: 85 },
  { value: "won", label: "Won", probability: 100 },
  { value: "lost", label: "Lost", probability: 0 },
] as const;

/** Legacy director_projects status values are preserved and displayed sensibly. */
export const LEGACY_STAGE_LABELS: Record<string, string> = {
  pipeline: "Pipeline (legacy)",
  active: "Active (legacy)",
  on_hold: "On hold (legacy)",
  completed: "Completed (legacy)",
  cancelled: "Cancelled (legacy)",
};

export const stageLabel = (status: string) =>
  DEAL_STAGES.find((s) => s.value === status)?.label ?? LEGACY_STAGE_LABELS[status] ?? status;

export const DEAL_SOURCES = [
  "Referral",
  "Website enquiry",
  "Existing client",
  "Tender",
  "Consultant",
  "Cold outreach",
  "Partner engineer",
  "Other",
];

export const OPEN_STAGES = [
  "new_lead",
  "qualified",
  "site_survey",
  "costing",
  "proposal",
  "negotiation",
  "pipeline",
  "active",
  "on_hold",
];

export const isOpenDeal = (d: Pick<Deal, "status">) => OPEN_STAGES.includes(d.status);

export const defaultProbability = (status: string) =>
  DEAL_STAGES.find((s) => s.value === status)?.probability ?? 0;

export const weightedValue = (d: Pick<Deal, "estimated_value" | "probability_percent" | "status">) => {
  const pct = d.probability_percent ?? defaultProbability(d.status);
  return (Number(d.estimated_value) || 0) * (Math.max(0, Math.min(100, pct)) / 100);
};

export const isOverdue = (d: Pick<Deal, "next_action_date" | "status">) => {
  if (!d.next_action_date || !isOpenDeal(d)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(d.next_action_date) < today;
};
