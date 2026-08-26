import { describe, expect, it } from "vitest";
import {
  DECK_NAV_ITEMS,
  NO_OVERFLOW_CLASS,
  SCROLL_CONTAINER_CLASS,
  TOUCH_TARGET_CLASS,
  TOUCH_TARGET_PX,
  buildDeckNav,
  navLabel,
  resolveActiveSection,
  selectSection,
  truncateTitle,
} from "./deckMobileNav";
import {
  BOQ_PENDING_MESSAGES,
  isClientVisibleStatus,
  pendingReasonForLines,
  resolveClientBoq,
  sortRevisions,
} from "./deckBoqResolver";
import {
  NOTIFY_FORBIDDEN_KEYS,
  NOTIFY_RECIPIENT,
  accessGrantedDespiteMail,
  adminProjectLink,
  bodyIsSafe,
  configBlocker,
  formatSast,
  notifyIdempotencyKey,
  notifySubject,
  notifyText,
  shouldNotify,
} from "./deckNotify";
import { CLIENT_BOQ_LINE_KEYS } from "./deckViewer";

/* --------------------------------------------------- mobile deck navigation */

describe("mobile deck navigation", () => {
  it("lists every deck section, including BOQ and notes", () => {
    const nav = buildDeckNav({ gallery: 2, documents: 3, options: 3 });
    const labels = nav.map((n) => n.label);
    for (const expected of [
      "Overview",
      "Scope",
      "Design & plans",
      "Schedule of works",
      "Programme",
      "Documents",
      "Next steps",
      "BOQ & acceptance",
      "Project notes",
      "Solution options",
    ])
      expect(labels).toContain(expected);
    expect(DECK_NAV_ITEMS.length).toBe(11);
  });

  it("hides optional sections that carry no content", () => {
    const nav = buildDeckNav();
    expect(nav.map((n) => n.id)).not.toContain("gallery");
    expect(nav.map((n) => n.id)).not.toContain("documents");
    expect(nav.map((n) => n.id)).not.toContain("options");
    expect(buildDeckNav({ documents: 1 }).map((n) => n.id)).toContain("documents");
    expect(buildDeckNav({ options: 3 }).map((n) => n.id)).toContain("options");
  });


  it("shows the active section and closes after selection", () => {
    const nav = buildDeckNav({ documents: 1 });
    expect(navLabel(nav, "boq")).toBe("BOQ & acceptance");
    const result = selectSection(nav, "notes");
    expect(result).toEqual({ active: "notes", href: "#notes", open: false });
    expect(resolveActiveSection(nav, "nope")).toBe("overview");
  });

  it("truncates long project titles safely without breaking layout", () => {
    const long = "353 Anton Lembede Street High-Rise Building Project — Durban CBD";
    const short = truncateTitle(long, 30);
    expect(short.length).toBeLessThanOrEqual(30);
    expect(short.endsWith("…")).toBe(true);
    expect(truncateTitle("  Spaced   Title  ")).toBe("Spaced Title");
    expect(truncateTitle(null)).toBe("Project deck");
  });

  it("keeps accessible touch targets and prevents page-level horizontal overflow", () => {
    expect(TOUCH_TARGET_PX).toBeGreaterThanOrEqual(44);
    expect(TOUCH_TARGET_CLASS).toContain("min-h-[44px]");
    expect(NO_OVERFLOW_CLASS).toContain("overflow-x-hidden");
    expect(NO_OVERFLOW_CLASS).toContain("max-w-full");
    // wide content scrolls inside its own container instead of the page
    expect(SCROLL_CONTAINER_CLASS).toContain("overflow-x-auto");
    expect(SCROLL_CONTAINER_CLASS).not.toContain("overflow-x-hidden");
  });
});

/* ------------------------------------------------------------ BOQ resolution */

describe("client BOQ resolution", () => {
  const project = "p1";
  const rows = [
    { id: "b1", project_id: "p1", status: "draft", version_no: 3, updated_at: "2026-08-03T00:00:00Z" },
    { id: "b2", project_id: "p1", status: "shared", version_no: 2, updated_at: "2026-08-02T00:00:00Z" },
    { id: "b3", project_id: "p1", status: "approved", version_no: 1, updated_at: "2026-08-04T00:00:00Z" },
  ];

  it("only ever considers client-visible statuses", () => {
    expect(isClientVisibleStatus("Draft")).toBe(false);
    expect(isClientVisibleStatus(" Approved ")).toBe(true);
    const res = resolveClientBoq(rows, { project_id: project });
    expect(res.boq?.id).toBe("b2");
  });

  it("prefers a revision designated for the deck", () => {
    const res = resolveClientBoq(rows, { project_id: project, designated_ids: ["b3"] });
    expect(res.boq?.id).toBe("b3");
    expect(res.reason).toBeNull();
    if (res.reason === null) expect(res.designated).toBe(true);
    // a designated but unissued revision never leaks
    const draft = resolveClientBoq([rows[0]], { project_id: project, designated_ids: ["b1"] });
    expect(draft.boq).toBeNull();
    expect(draft.reason).toBe("designated_revision_not_issued");
  });

  it("never crosses projects", () => {
    const other = [{ id: "x1", project_id: "p2", status: "approved", version_no: 9, updated_at: "2026-09-01T00:00:00Z" }];
    const res = resolveClientBoq(other, { project_id: project });
    expect(res.boq).toBeNull();
    expect(res.reason).toBe("no_boq_for_project");
  });

  it("orders revisions newest first", () => {
    expect(sortRevisions(rows).map((r) => r.id)).toEqual(["b1", "b2", "b3"]);
  });

  it("reports a truthful pending state instead of inventing pricing", () => {
    const res = resolveClientBoq([rows[0]], { project_id: project });
    expect(res.boq).toBeNull();
    expect(res.reason).toBe("no_issued_revision");
    expect(BOQ_PENDING_MESSAGES.no_issued_revision).toMatch(/not yet issued/i);
    expect(pendingReasonForLines(0)).toBe("no_client_lines");
    expect(pendingReasonForLines(5)).toBeNull();
  });

  it("keeps the client field allowlist free of supplier commercials", () => {
    for (const banned of ["supplier_cost", "supplier_name", "markup_percent", "margin", "internal_notes"])
      expect(CLIENT_BOQ_LINE_KEYS as unknown as string[]).not.toContain(banned);
  });
});

/* ----------------------------------------------------- view notification */

describe("internal view notification", () => {
  const granted = {
    outcome: "granted" as const,
    method: "POST",
    viewer_id: "v1",
    first_name: "Ayanda",
    surname: "Mkhize",
    email: "ayanda@client.co.za",
    consent: true,
  };

  it("notifies only on a successful gate submission", () => {
    expect(shouldNotify(granted)).toBe(true);
    expect(shouldNotify({ ...granted, outcome: "expired" })).toBe(false);
    expect(shouldNotify({ ...granted, outcome: "revoked" })).toBe(false);
    expect(shouldNotify({ ...granted, outcome: "invalid" })).toBe(false);
    expect(shouldNotify({ ...granted, method: "OPTIONS" })).toBe(false);
    expect(shouldNotify({ ...granted, method: "GET" })).toBe(false);
    expect(shouldNotify({ ...granted, surname: " " })).toBe(false);
    expect(shouldNotify({ ...granted, email: "nope" })).toBe(false);
    expect(shouldNotify({ ...granted, consent: false })).toBe(false);
  });

  it("sends one notification per unique access event and is idempotent on retry", () => {
    const a = notifyIdempotencyKey({ viewer_id: "v1", session_hash: "abc123" });
    expect(notifyIdempotencyKey({ viewer_id: "v1", session_hash: "abc123" })).toBe(a);
    // a fresh gate entry mints a new session, so a new notification is expected
    expect(notifyIdempotencyKey({ viewer_id: "v1", session_hash: "def456" })).not.toBe(a);
  });

  it("addresses Siyakha only, never the viewer", () => {
    expect(NOTIFY_RECIPIENT).toBe("nikita@siyakhatechnology.co.za");
    expect(NOTIFY_RECIPIENT).not.toBe(granted.email);
    expect(notifySubject("353 Anton Lembede Street")).toBe("Project viewed — 353 Anton Lembede Street");
  });

  it("never carries the share token or any commercial detail", () => {
    const body = notifyText({
      project_title: "353 Anton Lembede Street",
      client_name: "Platinum",
      site_name: "Durban CBD",
      first_name: "Ayanda",
      surname: "Mkhize",
      email: "ayanda@client.co.za",
      accessed_at: formatSast("2026-08-05T07:30:00Z"),
      admin_link: adminProjectLink("https://siyakhatechnology.co.za/", "p1"),
    });
    expect(bodyIsSafe(body, "secret-token-value")).toBe(true);
    expect(body).not.toContain("secret-token-value");
    for (const key of NOTIFY_FORBIDDEN_KEYS) expect(body.toLowerCase()).not.toContain(key);
    expect(body).toContain("2026-08-05 09:30 SAST");
    expect(body).toContain("https://siyakhatechnology.co.za/helpdesk/project-management/p1");
    expect(bodyIsSafe("token: abc")).toBe(false);
  });

  it("reports configuration blockers instead of sending", () => {
    expect(configBlocker({ api_key: "", sender: "a@b.co" })).toMatch(/RESEND_API_KEY/);
    expect(configBlocker({ api_key: "k", sender: "" })).toMatch(/sender/i);
    expect(configBlocker({ api_key: "k", sender: "a@b.co" })).toBeNull();
  });

  it("never blocks deck access when mail fails", () => {
    const failed = accessGrantedDespiteMail({ ok: false, error: "provider 500" });
    expect(failed.access_granted).toBe(true);
    expect(failed.delivery_status).toBe("failed");
    expect(accessGrantedDespiteMail({ ok: true }).delivery_status).toBe("sent");
  });
});
