import { describe, it, expect, vi } from "vitest";
import { assertCampaignEnvelope, decodeCabinetPhoto, readBoundedJson, PHOTO_MAX_BYTES, REQUEST_MAX_BYTES } from "../../supabase/functions/submit-lead/campaignPhoto";
import { submitCampaignQuote, type QuoteDependencies } from "../../supabase/functions/submit-lead/campaignQuote";
import { buildLeadEmailRequests } from "../../supabase/functions/submit-lead/leadEmail";
const photos = {"png": {"mime": "image/png", "base64": "iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAIAAADZSiLoAAAAF0lEQVR4nGMUCdBgYGBgYGBgYoABBAsAD7QAkhTqwv0AAAAASUVORK5CYII="}, "jpeg": {"mime": "image/jpeg", "base64": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAADAAMDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDzmiiiuY8c/9k="}, "webp": {"mime": "image/webp", "base64": "UklGRjIAAABXRUJQVlA4ICYAAABwAQCdASoDAAMAAUAmJZgCdAFAAAD++AQ/BskU3I/8B/Ev7AsQAA=="}};
const row = { source: "december-cleanup-2026", dedupe_key: "day-request", phone: "0877239183", company: "Test", project_description: "Scope: both; requested December date", work_email: "customer@example.org" };
const setup = () => {
  let stored: Record<string, unknown> & { id: string } | null = null;
  const deps: QuoteDependencies = {
    find: vi.fn(async () => stored),
    store: vi.fn(async () => undefined), remove: vi.fn(async () => undefined),
    insert: vi.fn(async input => { stored = { ...input, id: "test-lead" }; return stored; }),
    notify: vi.fn(async () => true), updateNotification: vi.fn(async (_id, status) => { if (stored) stored.notification_status = status; }),
    hash: vi.fn(async value => String(value.length) + value.slice(-16)), randomId: () => "server-random-id",
    emailConfigured: true, emailHtml: () => "<p>complete escaped details</p>",
  };
  return deps;
};
describe("cabinet image safety", () => {
  it("rejects every public recipient, URL or path injection", () => {
    for (const key of ["to", "cc", "bcc", "recipients", "reply_to", "photo_url", "photo_path"]) {
      expect(() => assertCampaignEnvelope({ ...row, [key]: "attacker" })).toThrow();
    }
    expect(() => assertCampaignEnvelope(row)).not.toThrow();
  });
  it("rejects a corrupt PNG with intact opening and closing signatures", () => {
    const bytes = Uint8Array.from(atob(photos.png.base64), c => c.charCodeAt(0));
    bytes[45] ^= 1;
    expect(() => decodeCabinetPhoto({ ...photos.png, base64: btoa(String.fromCharCode(...bytes)) })).toThrow();
  });
  it.each(Object.values(photos))("accepts genuine bounded $mime bytes", photo => {
    expect(decodeCabinetPhoto(photo).bytes.length).toBeGreaterThan(0);
  });
  it("rejects MIME disguise, SVG, empty bytes, invalid/noncanonical base64 and oversize", () => {
    for (const photo of [ { ...photos.png, mime: "image/jpeg" }, { mime:"image/png", base64:btoa("<svg>hello</svg>") },
      {mime:"image/svg+xml",base64:photos.png.base64}, {mime:"image/png",base64:""},
      {mime:"image/png",base64:"!!!!"}, {mime:"image/png",base64:"YR=="},
      {mime:"image/png",base64:"A".repeat(Math.ceil(PHOTO_MAX_BYTES/3)*4+4)} ]) {
      expect(() => decodeCabinetPhoto(photo)).toThrow();
    }
  });
  it("rejects truncated and appended images", () => {
    for (const photo of Object.values(photos)) {
      const decoded=atob(photo.base64);
      expect(()=>decodeCabinetPhoto({...photo,base64:btoa(decoded.slice(0,-5))})).toThrow();
    }
  });
  it("guards declared and streamed whole request size before parsing", async () => {
    await expect(readBoundedJson(new Request("http://test", {method:"POST",headers:{"Content-Type":"application/json","Content-Length":String(REQUEST_MAX_BYTES+1)},body:"{}"}))).rejects.toThrow("Request too large");
    await expect(readBoundedJson(new Request("http://test", {method:"POST",headers:{"Content-Type":"application/json"},body:" ".repeat(REQUEST_MAX_BYTES+1)}))).rejects.toThrow("Request too large");
    expect((await readBoundedJson(new Request("http://test", {method:"POST",headers:{"Content-Type":"application/json"},body:'{"ok":true}'}))).body).toEqual({ok:true});
    await expect(readBoundedJson(new Request("http://test", {method:"POST",headers:{"Content-Type":"application/json"},body:"oops"}))).rejects.toThrow();
  });
});
describe("campaign persistence and email (mock writes only)", () => {
  it("stores privately before lead insert, attaches validated bytes and ignores recipient injection", async () => {
    const deps=setup(); const result=await submitCampaignQuote({...row,to:["attacker@example.com"],recipients:["attacker@example.com"]},photos.png,deps);
    expect(result).toMatchObject({lead_id:"test-lead",photo_stored:true,status:"stored",notification_status:"sent",email_delivered:false});
    expect(deps.store).toHaveBeenCalledWith("december-cleanup-2026/server-random-id.png",expect.any(Uint8Array),"image/png");
    expect(vi.mocked(deps.store).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(deps.insert).mock.invocationCallOrder[0]);
    const requests=vi.mocked(deps.notify).mock.calls.map(call=>call[0]);
    expect(requests.map(request=>request.to)).toEqual([["nikita@siyakhatechnology.co.za"],["Ben@siyakhatechnology.co.za"]]);
    requests.forEach(request=>{expect(request.reply_to).toBe("customer@example.org");expect(request.subject).toContain("quote requested");expect(request.attachments?.[0].content).toBe(photos.png.base64);});
  });
  it("does not insert/send or report success after photo storage fails",async()=>{
    const deps=setup();vi.mocked(deps.store).mockRejectedValue(new Error("storage failed"));
    await expect(submitCampaignQuote(row,photos.png,deps)).rejects.toThrow("storage failed");
    expect(deps.insert).not.toHaveBeenCalled();expect(deps.notify).not.toHaveBeenCalled();
  });
  it("cleans photo after failed lead insertion, never sends",async()=>{
    const deps=setup();vi.mocked(deps.insert).mockRejectedValue(new Error("insert failed"));
    await expect(submitCampaignQuote(row,photos.png,deps)).rejects.toThrow("insert failed");
    expect(deps.remove).toHaveBeenCalled();expect(deps.notify).not.toHaveBeenCalled();
  });
  it("dedupes retries and suppresses repeat sends after success",async()=>{
    const deps=setup();await submitCampaignQuote(row,photos.png,deps);
    const retry=await submitCampaignQuote(row,photos.png,deps);
    expect(retry.duplicate).toBe(true);expect(deps.store).toHaveBeenCalledTimes(1);expect(deps.insert).toHaveBeenCalledTimes(1);expect(deps.notify).toHaveBeenCalledTimes(2);
  });
  it("partial rejection still attempts both, retry uses same idempotency keys",async()=>{
    const deps=setup();vi.mocked(deps.notify).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    expect((await submitCampaignQuote(row,photos.png,deps)).notification_status).toBe("partial");
    expect(vi.mocked(deps.notify).mock.calls).toHaveLength(2);
    expect((await submitCampaignQuote(row,photos.png,deps)).notification_status).toBe("sent");
    const calls=vi.mocked(deps.notify).mock.calls;expect(calls[0][1]).toBe(calls[2][1]);expect(calls[1][1]).toBe(calls[3][1]);
  });
  it("no sends/network failure is distinct from stored photo",async()=>{
    const deps=setup();vi.mocked(deps.notify).mockRejectedValue(new Error("network"));
    const result=await submitCampaignQuote(row,photos.png,deps);
    expect(result.notification_status).toBe("failed");expect(result.photo_stored).toBe(true);expect(result.email_delivered).toBe(false);expect(deps.notify).toHaveBeenCalledTimes(2);
  });
  it("resolves concurrent unique-key collision without duplicate photo retention",async()=>{
    const deps=setup();let reads=0;const existing={id:"winner",...row,project_description:"Private cabinet photo: website-orders/december-cleanup-2026/winner.png",notification_status:"sent"};
    vi.mocked(deps.find).mockImplementation(async()=>++reads===1?null:existing);vi.mocked(deps.insert).mockResolvedValue(null);
    expect((await submitCampaignQuote(row,photos.png,deps)).lead_id).toBe("winner");expect(deps.remove).toHaveBeenCalled();expect(deps.notify).not.toHaveBeenCalled();
  });
  it("missing lead or absent photo reference never succeeds",async()=>{
    const deps=setup();vi.mocked(deps.insert).mockResolvedValue(null);
    await expect(submitCampaignQuote(row,photos.png,deps)).rejects.toThrow("could not be stored");
    vi.mocked(deps.find).mockResolvedValue({...row,id:"legacy"});
    await expect(submitCampaignQuote(row,photos.png,deps)).rejects.toThrow("photo was not stored");
  });
  it("unrelated forms retain original recipients and no attachment",()=>{
    const requests=buildLeadEmailRequests({...row,source:"website"},"body",{filename:"ignored.png",content:photos.png.base64});
    expect(requests.map(r=>r.to[0])).toEqual(["nikita@siyakhatechnology.co.za","nikitajacobs01@gmail.com"]);expect(requests[0].attachments).toBeUndefined();
  });
});
