import { describe, expect, it } from "vitest";
import {
  EDIT_TOOLS,
  PLACE_TOOLS,
  boqStatus,
  contextActions,
  editToolEnabled,
  saveStateLabel,
} from "./planWorkspace";

describe("command bar tools", () => {
  it("offers the five placement tools wired to real marker types", () => {
    expect(PLACE_TOOLS.map((t) => t.value)).toEqual(["camera", "wifi_ap", "rack", "switch", "cable_route"]);
  });

  it("exposes the single coherent edit action set", () => {
    expect(EDIT_TOOLS.map((t) => t.value)).toEqual([
      "select",
      "move",
      "aim",
      "coverage",
      "properties",
      "archive",
    ]);
  });

  it("only enables Select with no selection", () => {
    for (const t of EDIT_TOOLS) expect(editToolEnabled(t.value, null)).toBe(t.value === "select");
  });

  it("enables Aim for cameras only", () => {
    expect(editToolEnabled("aim", { id: "1", marker_type: "camera" })).toBe(true);
    expect(editToolEnabled("aim", { id: "2", marker_type: "wifi_ap" })).toBe(false);
  });

  it("disables Coverage for racks, routes and notes", () => {
    expect(editToolEnabled("coverage", { id: "1", marker_type: "rack" })).toBe(false);
    expect(editToolEnabled("coverage", { id: "2", marker_type: "cable_route" })).toBe(false);
    expect(editToolEnabled("coverage", { id: "3", marker_type: "wifi_ap" })).toBe(true);
  });
});

describe("context strip actions", () => {
  it("gives cameras aim and FOV, APs coverage only", () => {
    expect(contextActions("camera")).toEqual(["move", "aim", "fov", "coverage", "edit"]);
    expect(contextActions("wifi_ap")).toEqual(["move", "coverage", "edit"]);
  });

  it("gives racks the rack build entry point", () => {
    expect(contextActions("rack")).toEqual(["rack_build"]);
  });

  it("falls back to move / properties / archive for other devices", () => {
    expect(contextActions("data_point")).toEqual(["move", "properties", "archive"]);
    expect(contextActions(null)).toEqual([]);
  });
});

describe("BOQ status truthfulness", () => {
  it("reports auto-sync only when a design bill is actually linked", () => {
    expect(boqStatus("boq-1").linked).toBe(true);
    expect(boqStatus("boq-1").label).toBe("BOQ auto-sync on");
  });

  it("reports not linked for empty, blank or missing links", () => {
    for (const v of [null, undefined, "", "   "]) {
      expect(boqStatus(v).linked).toBe(false);
      expect(boqStatus(v).label).toBe("BOQ not linked");
    }
  });
});

describe("save state", () => {
  it("never claims saved while saving or after a failure", () => {
    expect(saveStateLabel("idle")).toBe("All changes saved");
    expect(saveStateLabel("saving")).toBe("Saving…");
    expect(saveStateLabel("error")).toContain("Not saved");
  });
});
