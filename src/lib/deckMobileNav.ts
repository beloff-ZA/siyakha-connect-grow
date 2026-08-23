/**
 * Pure rules for the mobile navigation of the client project deck.
 *
 * The desktop deck keeps its inline anchor navigation untouched; on small
 * screens the same section list is presented through one compact sticky
 * selector. Everything here is presentation logic only — no data access.
 */

export type DeckNavItem = { id: string; label: string };

/** The canonical deck sections, in reading order. */
export const DECK_NAV_ITEMS: readonly DeckNavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "scope", label: "Scope" },
  { id: "design", label: "Design & plans" },
  { id: "schedule", label: "Schedule of works" },
  { id: "boq", label: "BOQ & acceptance" },
  { id: "notes", label: "Project notes" },
  { id: "programme", label: "Programme" },
  { id: "gallery", label: "Site gallery" },
  { id: "documents", label: "Documents" },
  { id: "next", label: "Next steps" },
] as const;

/** Sections that are always present, regardless of the pack contents. */
export const DECK_OPTIONAL_SECTIONS = ["gallery", "documents"] as const;

/**
 * Builds the nav for one deck. Optional sections only appear when the pack
 * actually carries that content, so a mobile viewer never opens an empty page.
 */
export function buildDeckNav(opts: { gallery?: number; documents?: number } = {}): DeckNavItem[] {
  return DECK_NAV_ITEMS.filter((item) => {
    if (item.id === "gallery") return (opts.gallery ?? 0) > 0;
    if (item.id === "documents") return (opts.documents ?? 0) > 0;
    return true;
  }).map((item) => ({ ...item }));
}

export const navLabel = (nav: readonly DeckNavItem[], id: string) =>
  nav.find((n) => n.id === id)?.label ?? nav[0]?.label ?? "";

/** The mobile selector always resolves to a real section. */
export const resolveActiveSection = (nav: readonly DeckNavItem[], id: string) =>
  nav.some((n) => n.id === id) ? id : (nav[0]?.id ?? "");

/**
 * Selecting a section navigates by hash and closes the sheet. Returned as a
 * plain object so the behaviour can be asserted without a DOM.
 */
export function selectSection(nav: readonly DeckNavItem[], id: string) {
  const active = resolveActiveSection(nav, id);
  return { active, href: `#${active}`, open: false } as const;
}

/** Safe single-line truncation for the compact mobile project header. */
export function truncateTitle(title: string | null | undefined, max = 42): string {
  const clean = String(title ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return "Project deck";
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}

/** Minimum accessible touch target, applied to every mobile deck control. */
export const TOUCH_TARGET_PX = 44;
export const TOUCH_TARGET_CLASS = "min-h-[44px] min-w-[44px]";

/** Root classes that prevent horizontal page overflow at 320–430px. */
export const NO_OVERFLOW_CLASS = "w-full max-w-full overflow-x-hidden";

/**
 * Wide content (tables, BOQ schedules) scrolls inside its own labelled
 * container instead of compressing or widening the page.
 */
export const SCROLL_CONTAINER_CLASS = "w-full max-w-full overflow-x-auto";
