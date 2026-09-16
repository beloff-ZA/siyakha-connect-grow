import { describe, expect, it } from "vitest";
import {
  clientVisible,
  documentLabel,
  revisionSiblings,
  technicianVisible,
  type ProjectDocument,
} from "@/lib/projectDocuments";

const doc = (over: Partial<ProjectDocument>): ProjectDocument => ({
  id: "d1",
  project_id: "p1",
  title: "Low Level Layout – Fifth Floor",
  category: "Drawing",
  reference: "LLL-05",
  version: "C",
  document_date: "2026-09-01",
  floor_id: null,
  storage_path: "p1/documents/a.pdf",
  file_size: 100,
  mime_type: "application/pdf",
  client_visible: false,
  technician_visible: false,
  is_current: true,
  archived: false,
  created_at: "2026-09-01T00:00:00Z",
  ...over,
});

describe("project documents", () => {
  it("labels a drawing with its reference and revision", () => {
    expect(documentLabel(doc({}))).toBe("Low Level Layout – Fifth Floor (LLL-05), Rev C");
    expect(documentLabel(doc({ reference: null, version: null }))).toBe("Low Level Layout – Fifth Floor");
    expect(documentLabel(doc({ reference: null, version: "Rev B" }))).toBe("Low Level Layout – Fifth Floor, Rev B");
  });

  it("shows technicians only current, technician-visible documents", () => {
    const rows = [
      doc({ id: "a", technician_visible: true }),
      doc({ id: "b", technician_visible: false }),
      doc({ id: "c", technician_visible: true, is_current: false }),
      doc({ id: "d", technician_visible: true, archived: true }),
    ];
    expect(technicianVisible(rows).map((d) => d.id)).toEqual(["a"]);
  });

  it("shows clients only released documents and never technician-only ones", () => {
    const rows = [
      doc({ id: "a", client_visible: true }),
      doc({ id: "b", technician_visible: true }),
      doc({ id: "c", client_visible: true, archived: true }),
    ];
    expect(clientVisible(rows).map((d) => d.id)).toEqual(["a"]);
  });

  it("groups revisions of the same drawing without touching other documents", () => {
    const current = doc({ id: "new", version: "D" });
    const rows = [current, doc({ id: "old", version: "C" }), doc({ id: "other", reference: "LLL-04" })];
    expect(revisionSiblings(current, rows).map((d) => d.id)).toEqual(["old"]);
  });
});
