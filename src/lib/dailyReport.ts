import type { FloorProgress, ScopeChange, SiteIssue, SitePhoto, SiteUpdate } from "@/lib/siteDelivery";
import type { NextStep } from "@/lib/nextSteps";

/**
 * Assembles a client-facing site progress report from data that is ALREADY
 * recorded (daily updates, named photos, additional works, next steps, floor
 * progress). Nothing is invented: anything not captured is simply omitted, and
 * headline fields fall back to "Not reported".
 *
 * The builder takes a date range so the same structure can later drive a weekly
 * report — the daily report is just a one-day range.
 */

export const NOT_REPORTED = "Not reported";

export type ReportPhoto = {
  id: string;
  title: string;
  description: string | null;
  work_date: string;
  floor: string | null;
  timestamp_confirmed: boolean;
  storage_path: string;
};

export type ReportDay = {
  work_date: string;
  team: string;
  floors: string[];
  categories: string[];
  work_completed: string | null;
  work_outstanding: string | null;
  quantities: string | null;
  blockers: string | null;
  notes: string | null;
  submitted_at: string;
  backdated: boolean;
  published: boolean;
  approval_status: string;
  photos: ReportPhoto[];
};

export type ReportScopeItem = {
  id: string;
  work_date: string;
  title: string;
  description: string | null;
  trigger_reason: string | null;
  status: string;
  floor: string | null;
};

export type SiteReport = {
  project_title: string;
  project_reference: string | null;
  client_name: string | null;
  site_label: string | null;
  from: string;
  to: string;
  generated_at: string;
  days: ReportDay[];
  photos: ReportPhoto[];
  scope_items: ReportScopeItem[];
  issues: { id: string; title: string; description: string | null; status: string; floor: string | null }[];
  next_steps: { id: string; title: string; detail: string | null; status: string; due_date: string | null }[];
  floor_progress: { floor: string; progress_pct: number; status: string }[];
  overall_progress: number | null;
  published: boolean;
};

export type ReportInput = {
  project: { title: string; reference?: string | null; address?: string | null };
  client_name?: string | null;
  from: string;
  to?: string;
  floors: { id: string; display_name: string }[];
  updates: SiteUpdate[];
  photos: SitePhoto[];
  issues: SiteIssue[];
  scopeChanges: ScopeChange[];
  nextSteps: NextStep[];
  progress: FloorProgress[];
  /** Client reports hide anything not released; internal previews show the same data minus internal notes. */
  audience?: "client";
};

const inRange = (d: string, from: string, to: string) => d >= from && d <= to;
const clean = (v?: string | null) => {
  const t = (v ?? "").trim();
  return t.length ? t : null;
};

/** Builds the report for one work date (or a range, for later weekly use). */
export function buildSiteReport(input: ReportInput): SiteReport {
  const from = input.from;
  const to = input.to ?? input.from;
  const floorName = (id: string | null) => input.floors.find((f) => f.id === id)?.display_name ?? null;

  const updates = input.updates
    .filter((u) => inRange(u.shift_date, from, to))
    .sort((a, b) => (a.shift_date < b.shift_date ? -1 : a.shift_date > b.shift_date ? 1 : 0));

  const photoFor = (u: SiteUpdate): ReportPhoto[] =>
    input.photos
      .filter((p) => p.update_id === u.id && p.client_visible !== false)
      .map((p) => ({
        id: p.id,
        title: clean(p.title) ?? clean(p.caption) ?? "Site photograph",
        description: clean(p.caption) && clean(p.title) ? clean(p.caption) : null,
        work_date: u.shift_date,
        floor: floorName(p.floor_id ?? u.floor_id),
        timestamp_confirmed: !!p.timestamp_confirmed,
        storage_path: p.storage_path,
      }));

  const byDate = new Map<string, ReportDay>();
  for (const u of updates) {
    const photos = photoFor(u);
    const existing = byDate.get(u.shift_date);
    const day: ReportDay = existing ?? {
      work_date: u.shift_date,
      team: NOT_REPORTED,
      floors: [],
      categories: [],
      work_completed: null,
      work_outstanding: null,
      quantities: null,
      blockers: null,
      notes: null,
      submitted_at: u.submitted_at,
      backdated: !!u.backdated,
      published: false,
      approval_status: u.approval_status,
      photos: [],
    };
    const team = clean(u.team_onsite) ?? clean(u.submitted_by_name);
    if (team && day.team === NOT_REPORTED) day.team = team;
    const floor = floorName(u.floor_id) ?? clean(u.area_label);
    if (floor && !day.floors.includes(floor)) day.floors.push(floor);
    if (clean(u.area_label) && !day.floors.includes(u.area_label!.trim())) day.floors.push(u.area_label!.trim());
    const cat = clean(u.category) ?? clean(u.baseline_category);
    if (cat && !day.categories.includes(cat)) day.categories.push(cat);
    day.work_completed = [day.work_completed, clean(u.work_completed)].filter(Boolean).join("\n") || null;
    day.work_outstanding = [day.work_outstanding, clean(u.work_outstanding)].filter(Boolean).join("\n") || null;
    day.quantities = [day.quantities, clean(u.materials_required)].filter(Boolean).join("\n") || null;
    day.blockers = [day.blockers, clean(u.blockers)].filter(Boolean).join("\n") || null;
    day.notes = [day.notes, clean(u.notes)].filter(Boolean).join("\n") || null;
    day.published = day.published || (!!u.client_visible && !!u.published_at);
    day.photos = [...day.photos, ...photos];
    byDate.set(u.shift_date, day);
  }
  const days = [...byDate.values()].sort((a, b) => (a.work_date < b.work_date ? -1 : 1));

  const scope_items = input.scopeChanges
    .filter((s) => s.client_visible === true && inRange(s.work_date, from, to))
    .map((s) => ({
      id: s.id,
      work_date: s.work_date,
      title: s.title,
      description: clean(s.description),
      trigger_reason: clean(s.trigger_reason),
      status: s.status,
      floor: floorName(s.floor_id) ?? clean(s.area_label),
    }));

  const issues = input.issues
    .filter((i) => i.client_visible === true && !i.internal_only)
    .map((i) => ({
      id: i.id,
      title: i.title,
      description: clean(i.description),
      status: i.status,
      floor: floorName(i.floor_id) ?? clean(i.location_note),
    }));

  const next_steps = input.nextSteps
    .filter((s) => s.client_visible && s.status !== "done")
    .map((s) => ({ id: s.id, title: s.title, detail: clean(s.detail), status: s.status, due_date: s.due_date }));

  const floor_progress = input.progress
    .filter((p) => typeof p.progress_pct === "number")
    .map((p) => ({ floor: floorName(p.floor_id) ?? "Site", progress_pct: p.progress_pct, status: p.status }))
    .filter((p) => !!p.floor);

  return {
    project_title: input.project.title,
    project_reference: clean(input.project.reference),
    client_name: clean(input.client_name),
    site_label: clean(input.project.address),
    from,
    to,
    generated_at: new Date().toISOString(),
    days,
    photos: days.flatMap((d) => d.photos),
    scope_items,
    issues,
    next_steps,
    floor_progress,
    overall_progress: floor_progress.length
      ? Math.round(floor_progress.reduce((s, p) => s + p.progress_pct, 0) / floor_progress.length)
      : null,
    published: days.length > 0 && days.every((d) => d.published),
  };
}

/** Chronological publication history for the project (newest first). */
export function reportHistory(updates: SiteUpdate[]) {
  const map = new Map<string, { date: string; published: boolean; count: number }>();
  for (const u of updates) {
    const row = map.get(u.shift_date) ?? { date: u.shift_date, published: false, count: 0 };
    row.count += 1;
    row.published = row.published || (!!u.client_visible && !!u.published_at);
    map.set(u.shift_date, row);
  }
  return [...map.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const historyLabel = (row: { published: boolean }) =>
  row.published ? "Client report published" : "Internal only — not published";
