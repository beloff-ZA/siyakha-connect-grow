import { describe, expect, it } from "vitest";
import {
  DEFAULT_SECTION,
  duplicateFileWarnings,
  normalizeBuildingDetails,
  parseSection,
  preservesBaseline,
  projectWorkspacePath,
  suggestFloorFromFilename,
  suggestRevisionLabel,
  validateWizardStep,
  type WizardDraft,
} from "./projectWizard";

const draft = (over: Partial<WizardDraft> = {}): WizardDraft => ({
  client_id: "c1",
  site_id: "s1",
  title: "353 Anton Lembede",
  files: [],
  floors: [{ key: "f1", level_number: 0, display_name: "Ground floor" }],
  ...over,
});

describe("workspace routing", () => {
  it("keeps the project id in the path", () => {
    expect(projectWorkspacePath("p1")).toBe("/helpdesk/project-management/p1");
    expect(projectWorkspacePath("p1", "plans")).toBe("/helpdesk/project-management/p1?section=plans");
  });

  it("omits the query for the default section", () => {
    expect(projectWorkspacePath("p1", DEFAULT_SECTION)).toBe("/helpdesk/project-management/p1");
  });

  it("falls back to overview for unknown sections", () => {
    expect(parseSection("boq")).toBe("boq");
    expect(parseSection("nonsense")).toBe("overview");
    expect(parseSection(null)).toBe("overview");
  });
});

describe("filename to floor suggestions", () => {
  it("recognises named levels", () => {
    expect(suggestFloorFromFilename("353-ground-floor-plan.pdf").display_name).toBe("Ground floor");
    expect(suggestFloorFromFilename("Roof Plan Rev B.pdf").display_name).toBe("Roof");
    expect(suggestFloorFromFilename("basement parking.pdf").level_number).toBe(-1);
  });

  it("recognises numbered levels", () => {
    expect(suggestFloorFromFilename("LEVEL-07.png")).toMatchObject({ level_number: 7, display_name: "Level 7" });
    expect(suggestFloorFromFilename("plan_l03_rev2.jpg").level_number).toBe(3);
    expect(suggestFloorFromFilename("3rd floor.pdf").level_number).toBe(3);
  });

  it("falls back to page order", () => {
    expect(suggestFloorFromFilename("scan001.pdf", 2)).toMatchObject({ level_number: 2, display_name: "Level 2" });
  });
});

describe("baseline revision preservation", () => {
  it("labels the first confirmed revision as the baseline", () => {
    expect(suggestRevisionLabel(0)).toBe("Rev 0 — Baseline site plan");
    expect(suggestRevisionLabel(1)).toBe("Rev 1");
  });

  it("treats later uploads as new revisions, never overwrites", () => {
    expect(preservesBaseline(0)).toBe(false);
    expect(preservesBaseline(1)).toBe(true);
  });
});

describe("wizard validation", () => {
  it("requires a client then a title", () => {
    expect(validateWizardStep(1, draft({ client_id: "" }))).toContain("Select or create a client.");
    expect(validateWizardStep(1, draft())).toEqual([]);
    expect(validateWizardStep(2, draft({ title: "  " }))).toContain("A project title is required.");
  });

  it("rejects duplicate or non-integer levels and unassigned files", () => {
    expect(
      validateWizardStep(3, draft({ floors: [
        { key: "a", level_number: 1, display_name: "L1" },
        { key: "b", level_number: 1, display_name: "L1 copy" },
      ] })),
    ).toContain("Level numbers must be unique.");
    expect(validateWizardStep(3, draft({ floors: [{ key: "a", level_number: "x", display_name: "L" }] }))).toContain(
      "Level numbers must be whole numbers.",
    );
    expect(validateWizardStep(3, draft({ files: [{ name: "p.pdf", floorKey: null }] }))).toContain(
      "Assign every uploaded plan to a floor.",
    );
  });

  it("allows a project with no plans yet", () => {
    expect(validateWizardStep(3, draft())).toEqual([]);
    expect(validateWizardStep(4, draft())).toEqual([]);
  });

  it("aggregates every problem on review", () => {
    expect(validateWizardStep(4, draft({ client_id: "", title: "" })).length).toBe(2);
  });
});

describe("building details", () => {
  it("drops empty values and keeps numbers", () => {
    expect(normalizeBuildingDetails({ building_type: " Offices ", gfa_sqm: "1200", width_m: "", notes: "" })).toEqual({
      building_type: "Offices",
      gfa_sqm: 1200,
    });
    expect(normalizeBuildingDetails({})).toBeNull();
  });
});

describe("duplicate plan warnings", () => {
  it("matches on checksum or name and size", () => {
    expect(
      duplicateFileWarnings([{ name: "a.pdf", size: 10, checksum: "x" }], [{ original_filename: "b.pdf", file_size: 2, checksum: "x" }]),
    ).toHaveLength(1);
    expect(duplicateFileWarnings([{ name: "a.pdf", size: 10 }], [{ original_filename: "a.pdf", file_size: 10 }])).toHaveLength(1);
    expect(duplicateFileWarnings([{ name: "a.pdf", size: 11 }], [{ original_filename: "a.pdf", file_size: 10 }])).toHaveLength(0);
  });
});
