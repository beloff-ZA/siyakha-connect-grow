import { describe, expect, it } from "vitest";
import { jobCardSheetDocument, jobCardSheetFileName, jobCardSheetHtml, sheetDate, sheetKm, sheetTime } from "./jobCardSheet";

const call = {
  call_ref: "CALL-2026-38195",
  sit_number: "38195",
  logging_customer: "Satio",
  customer_order_ref: "Claudine",
  end_customer_company: "InteliGro",
  end_customer_first_name: "Julian",
  end_customer_last_name: "Julian",
  contact_number: "072 647 4783",
  site_address: "17 Fortuna Street",
  city: "Viljoenskroon",
  engineer_name: "Nikita",
  logged_at: "2026-09-11T11:57:00",
  arrival_at: "2026-09-15T11:45:00",
  departure_at: "2026-09-15T14:10:00",
  opening_km: 100,
  closing_km: 460,
  fault_description: "Assist with the router installation\nand testing.",
  fault_solution: "Connected fibre, link up, speed test done.",
  change_control: null,
  signed_by_name: "Neo Parkies",
  signed_at: "2026-09-15T14:20:00",
  satisfaction_rating: 5,
  signoff_comment: "All good",
  signature_data: "data:image/png;base64,AAA",
  // sensitive / internal — must never appear on the sheet
  internal_notes: "Charge Satio R2 500 labour",
  signoff_token: "secret-token-value-1234567890",
};

const items = [{ description: "Console cable", quantity: 1, serial_number: "SN123" }];

describe("Satio sign-off sheet", () => {
  it("uses the Satio form headings", () => {
    const html = jobCardSheetHtml(call, items);
    expect(html).toContain("Service request / end customer sign-off form");
    expect(html).toContain("End customer contact information");
    expect(html).toContain("Odometer readings");
    expect(html).toContain("Fault description as logged by customer");
    expect(html).toContain("Fault solution description");
    expect(html).toContain("Change control");
    expect(html).toContain("Additional items used");
    expect(html).toContain("Customer sign-off");
  });

  it("fills in the call, travel, items and sign-off details", () => {
    const html = jobCardSheetHtml(call, items);
    expect(html).toContain("38195");
    expect(html).toContain("Satio");
    expect(html).toContain("InteliGro");
    expect(html).toContain("17 Fortuna Street");
    expect(html).toContain("360"); // total kms
    expect(html).toContain("Console cable — S/N SN123");
    expect(html).toContain("Neo Parkies");
    expect(html).toContain("5 / 5");
    expect(html).toContain("data:image/png;base64,AAA");
  });

  it("never exposes internal notes or the signing token", () => {
    const html = jobCardSheetDocument(call, items);
    expect(html).not.toContain("Charge Satio");
    expect(html).not.toContain("secret-token-value");
  });

  it("leaves blank cells for missing details", () => {
    const html = jobCardSheetHtml({ call_ref: "CALL-1", end_customer_company: "Acme" }, []);
    expect(html).toContain("Acme");
    expect(html).toContain("&nbsp;");
  });

  it("can omit the sign-off block for live signing", () => {
    const html = jobCardSheetHtml(call, items, { signBlock: "omit" });
    expect(html).not.toContain("Dear end customer");
  });

  it("formats dates, times and kilometres like the paper form", () => {
    expect(sheetDate("2026-09-11T11:57:00")).toBe("11 / 09 / 2026");
    expect(sheetTime("2026-09-11T11:57:00")).toBe("11 Hrs 57 min");
    expect(sheetDate(null)).toBe("");
    expect(sheetKm(100, 460)).toBe("360");
    expect(sheetKm(460, 100)).toBe("");
    expect(sheetKm(null, 100)).toBe("");
  });

  it("names the file after the SIT number", () => {
    expect(jobCardSheetFileName(call)).toBe("Sign-off 38195.html");
  });
});
