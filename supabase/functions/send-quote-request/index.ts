// Public edge function — receives a quote request from /shop/quote
// Emails Nikita and Accounts with the customer's cart + billing details.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface QuoteItem {
  title: string;
  variantTitle?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  options?: Array<{ name: string; value: string }>;
}

interface Payload {
  customer: {
    company?: string;
    contactName: string;
    email: string;
    phone: string;
    vatNumber?: string;
    billingAddress: string;
    deliveryAddress?: string;
    poNumber?: string;
    notes?: string;
    hardwarePoints?: number;
    camerasNeeded?: number;
  };
  items: QuoteItem[];
  needSupport?: boolean;
}


const RECIPIENTS = ["nikita@siyakhatechnology.co.za", "accounts@siyakhatechnology.co.za"];
const FROM = "Siyakha Quotes <notifications@mail.siyakhatechnology.co.za>";

function esc(s: string) {
  return (s ?? "").toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function isEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function money(n: number, ccy: string) {
  try { return new Intl.NumberFormat("en-ZA", { style: "currency", currency: ccy }).format(n); }
  catch { return `${ccy} ${n.toFixed(2)}`; }
}

function buildHtml(p: Payload) {
  const currency = p.items[0]?.currency || "ZAR";
  const total = p.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const rows = p.items.map((i) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #eee;">
        <div style="font-weight:600;color:#111;">${esc(i.title)}</div>
        ${i.variantTitle && i.variantTitle !== "Default Title" ? `<div style="font-size:12px;color:#666;">${esc(i.variantTitle)}</div>` : ""}
        ${i.sku ? `<div style="font-size:11px;color:#999;">SKU: ${esc(i.sku)}</div>` : ""}
      </td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${money(i.unitPrice, i.currency)}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${money(i.unitPrice * i.quantity, i.currency)}</td>
    </tr>`).join("");

  const c = p.customer;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;padding:24px;color:#111;">
    <div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;">
      <div style="background:#000;color:#fff;padding:20px 24px;">
        <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#bbb;">Siyakha Technology</div>
        <div style="font-size:22px;font-weight:300;margin-top:4px;">New Quote Request</div>
      </div>
      <div style="padding:24px;">
        ${p.needSupport ? `
        <div style="background:#111;color:#fff;padding:14px 18px;margin-bottom:22px;border-left:4px solid #fff;">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#ccc;">Support requested</div>
          <div style="font-size:15px;margin-top:4px;">Customer needs installation / setup assistance — include labour and scheduling in the quote.</div>
        </div>
        ` : ""}
        <h3 style="margin:0 0 12px 0;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#666;">Billing / Customer</h3>

        <table width="100%" style="border-collapse:collapse;font-size:14px;">
          ${c.company ? `<tr><td style="padding:4px 0;color:#666;width:160px;">Company</td><td style="padding:4px 0;">${esc(c.company)}</td></tr>` : ""}
          <tr><td style="padding:4px 0;color:#666;">Contact</td><td style="padding:4px 0;">${esc(c.contactName)}</td></tr>
          <tr><td style="padding:4px 0;color:#666;">Email</td><td style="padding:4px 0;"><a href="mailto:${esc(c.email)}" style="color:#111;">${esc(c.email)}</a></td></tr>
          <tr><td style="padding:4px 0;color:#666;">Phone</td><td style="padding:4px 0;">${esc(c.phone)}</td></tr>
          ${c.vatNumber ? `<tr><td style="padding:4px 0;color:#666;">VAT Number</td><td style="padding:4px 0;">${esc(c.vatNumber)}</td></tr>` : ""}
          ${c.poNumber ? `<tr><td style="padding:4px 0;color:#666;">PO Number</td><td style="padding:4px 0;">${esc(c.poNumber)}</td></tr>` : ""}
          <tr><td style="padding:4px 0;color:#666;vertical-align:top;">Billing address</td><td style="padding:4px 0;white-space:pre-line;">${esc(c.billingAddress)}</td></tr>
          ${c.deliveryAddress ? `<tr><td style="padding:4px 0;color:#666;vertical-align:top;">Delivery address</td><td style="padding:4px 0;white-space:pre-line;">${esc(c.deliveryAddress)}</td></tr>` : ""}
        </table>

        ${c.notes ? `
          <h3 style="margin:24px 0 8px 0;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#666;">Notes</h3>
          <div style="font-size:14px;white-space:pre-line;background:#fafafa;border:1px solid #eee;padding:12px;">${esc(c.notes)}</div>
        ` : ""}

        <h3 style="margin:24px 0 8px 0;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#666;">Items requested</h3>
        <table width="100%" style="border-collapse:collapse;font-size:14px;border-top:2px solid #111;">
          <thead>
            <tr style="background:#fafafa;">
              <th align="left" style="padding:10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#666;">Product</th>
              <th style="padding:10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#666;">Qty</th>
              <th align="right" style="padding:10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#666;">Unit</th>
              <th align="right" style="padding:10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#666;">Line</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" align="right" style="padding:14px 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#666;">Estimated subtotal</td>
              <td align="right" style="padding:14px 10px;font-size:18px;font-weight:600;border-top:2px solid #111;">${money(total, currency)}</td>
            </tr>
          </tfoot>
        </table>

        <p style="margin:24px 0 0 0;font-size:12px;color:#666;line-height:1.6;">
          Eshlan will follow up with an official quote based on these items. Pricing shown is indicative retail from the website and excludes freight, install and any project discounts.
        </p>
      </div>
      <div style="padding:14px 24px;background:#fafafa;border-top:1px solid #eee;font-size:11px;color:#999;letter-spacing:0.14em;text-transform:uppercase;">
        Siyakha Technology · Automated quote request
      </div>
    </div>
  </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const payload = await req.json() as Payload;
    const c = payload.customer;
    const errors: string[] = [];
    if (!c || !c.contactName || c.contactName.length < 2) errors.push("Contact name is required");
    if (!c || !c.email || !isEmail(c.email)) errors.push("Valid email is required");
    if (!c || !c.phone || c.phone.length < 6) errors.push("Phone is required");
    if (!c || !c.billingAddress || c.billingAddress.length < 5) errors.push("Billing address is required");
    if (!Array.isArray(payload.items) || payload.items.length === 0) errors.push("Cart is empty");
    if (errors.length) {
      return new Response(JSON.stringify({ error: errors.join(", ") }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // sanitise strings, cap sizes
    const clean = (s?: string, n = 500) => (s ?? "").toString().slice(0, n);
    const cleanCustomer = {
      company: clean(c.company, 200),
      contactName: clean(c.contactName, 200),
      email: clean(c.email, 200).toLowerCase(),
      phone: clean(c.phone, 60),
      vatNumber: clean(c.vatNumber, 60),
      billingAddress: clean(c.billingAddress, 1000),
      deliveryAddress: clean(c.deliveryAddress, 1000),
      poNumber: clean(c.poNumber, 100),
      notes: clean(c.notes, 2000),
    };
    const cleanItems: QuoteItem[] = payload.items.slice(0, 200).map((i) => ({
      title: clean(i.title, 300),
      variantTitle: clean(i.variantTitle, 200),
      sku: clean(i.sku, 100),
      quantity: Math.max(1, Math.min(9999, Number(i.quantity) || 1)),
      unitPrice: Math.max(0, Number(i.unitPrice) || 0),
      currency: (i.currency || "ZAR").toString().slice(0, 6),
      options: Array.isArray(i.options) ? i.options.slice(0, 10).map((o) => ({ name: clean(o.name, 50), value: clean(o.value, 100) })) : [],
    }));

    const cleanNeedSupport = Boolean(payload.needSupport);
    const cleanPayload: Payload = { customer: cleanCustomer, items: cleanItems, needSupport: cleanNeedSupport };
    const html = buildHtml(cleanPayload);
    const subject = `Quote request${cleanNeedSupport ? " — INSTALL SUPPORT" : ""} — ${cleanCustomer.company || cleanCustomer.contactName} (${cleanItems.length} item${cleanItems.length !== 1 ? "s" : ""})`;


    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: RECIPIENTS,
        reply_to: cleanCustomer.email,
        subject,
        html,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error", data);
      return new Response(JSON.stringify({ error: "Failed to send", details: data }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Confirmation to the customer (best-effort, don't fail the request if this errors)
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM,
          to: [cleanCustomer.email],
          reply_to: "accounts@siyakhatechnology.co.za",
          subject: "We've received your quote request — Siyakha Technology",
          html: `<div style="font-family:Arial,sans-serif;padding:24px;color:#111;">
            <h2 style="font-weight:300;">Thank you, ${esc(cleanCustomer.contactName)}.</h2>
            <p style="font-size:14px;line-height:1.6;color:#333;">
              We've received your request for ${cleanItems.length} item${cleanItems.length !== 1 ? "s" : ""}. Eshlan from our accounts team will prepare an official quote and reply to <b>${esc(cleanCustomer.email)}</b> shortly.
            </p>
            <p style="font-size:13px;color:#666;">If it's urgent, call us on 081 501 2993.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
            <p style="font-size:11px;color:#999;letter-spacing:0.14em;text-transform:uppercase;">Siyakha Technology</p>
          </div>`,
        }),
      });
    } catch (e) { console.error("customer confirmation failed", e); }

    return new Response(JSON.stringify({ ok: true, id: data.id }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("send-quote-request error", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});