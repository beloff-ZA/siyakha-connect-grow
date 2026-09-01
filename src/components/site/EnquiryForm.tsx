import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  LEAD_BUDGETS,
  LEAD_LOCATIONS,
  LEAD_SERVICES,
  LEAD_TIMELINES,
  buildLeadPayload,
  emptyLeadForm,
  isQualifiedService,
  resolveService,
  validateLeadForm,
  type LeadFieldErrors,
  type LeadFormValues,
} from "@/lib/leadForm";
import { submitLead } from "@/lib/leadsApi";
import { captureAttribution, getAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";
import { CONTACT } from "@/lib/contact";

/**
 * Public B2B enquiry form. Every valid submission is stored server-side through
 * the `submit-lead` edge function; the browser only ever holds the publishable
 * key. `generate_lead` is fired only after a confirmed server-side write.
 */
const EnquiryForm = ({ defaultService }: { defaultService?: string }) => {
  const location = useLocation();
  const [values, setValues] = useState<LeadFormValues>(emptyLeadForm);
  const [errors, setErrors] = useState<LeadFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const startedAt = useRef<number | null>(null);
  const beganTracking = useRef(false);
  const qualifiedTracked = useRef<string | null>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  // Preselect service/location from the page context or ?service= / ?location=.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const service = resolveService(params.get("service") ?? defaultService ?? null);
    const loc = params.get("location");
    setValues((prev) => ({
      ...prev,
      service: prev.service || service || "",
      location:
        prev.location ||
        ((LEAD_LOCATIONS as readonly string[]).includes(loc ?? "") ? (loc as string) : ""),
    }));
  }, [location.search, defaultService]);

  const set = <K extends keyof LeadFormValues>(key: K, value: LeadFormValues[K]) => {
    if (!beganTracking.current) {
      beganTracking.current = true;
      startedAt.current = Date.now();
      trackEvent("begin_lead_form", { form_id: "site_enquiry" });
    }
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (key === "service" && typeof value === "string" && value) {
      if (isQualifiedService(value) && qualifiedTracked.current !== value) {
        qualifiedTracked.current = value;
        trackEvent("qualified_service_selection", { service: value });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || submitted) return;
    const nextErrors = validateLeadForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFormError("Please correct the highlighted fields.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    const payload = buildLeadPayload(values, getAttribution(), {
      pagePath: `${location.pathname}${location.search}`,
      formStartedAt: startedAt.current,
    });
    const result = await submitLead(payload);
    setSubmitting(false);

    if (!result.ok) {
      // No conversion event is fired when the server-side write fails.
      setFormError(
        result.error ??
          `Something went wrong. Please call ${CONTACT.phoneDisplay} or WhatsApp ${CONTACT.whatsappDisplay}.`,
      );
      toast.error("We could not send your enquiry — please try again or call us.");
      return;
    }

    if (!result.duplicate) {
      trackEvent("generate_lead", {
        lead_id: result.leadId,
        service: values.service,
        lead_location: values.location,
        budget_range: values.budget_range || null,
        timeline: values.timeline || null,
        currency: "ZAR",
        value: 0,
      });
    }
    setSubmitted(true);
    toast.success("Thanks — your enquiry is with us.");
  };

  const inputCls =
    "w-full border px-4 py-3 text-sm bg-foreground text-background placeholder:text-background/50 border-background/35 focus:border-background focus:outline-none transition-colors min-h-[44px]";
  const selectCls = `${inputCls} [color-scheme:dark]`;

  const errorText = (key: keyof LeadFormValues) =>
    errors[key] ? (
      <p id={`${key}-error`} role="alert" className="mt-1 text-xs text-background/90">
        {errors[key]}
      </p>
    ) : null;

  const aria = (key: keyof LeadFormValues) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  const serviceOptions = useMemo(() => LEAD_SERVICES, []);

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border border-background/35 p-8 text-background"
      >
        <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">Enquiry received</p>
        <h3 className="font-display font-light text-2xl md:text-3xl leading-snug">
          Thank you — we have your enquiry.
        </h3>
        <p className="mt-4 text-sm text-background/75 leading-relaxed">
          {CONTACT.ownerName} will reply personally within one business day. If it is urgent, call{" "}
          <a className="underline" href={`tel:${CONTACT.phoneE164}`}>
            {CONTACT.phoneDisplay}
          </a>{" "}
          or WhatsApp {CONTACT.whatsappDisplay}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 text-background">
      <div aria-live="polite" className="sr-only">
        {submitting ? "Sending your enquiry" : ""}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.22em] text-background/60 mb-2" htmlFor="lead-name">
            Full name *
          </label>
          <input
            id="lead-name"
            value={values.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            maxLength={120}
            autoComplete="name"
            className={inputCls}
            {...aria("full_name")}
          />
          {errorText("full_name")}
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.22em] text-background/60 mb-2" htmlFor="lead-company">
            Company / organisation
          </label>
          <input
            id="lead-company"
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
            maxLength={160}
            autoComplete="organization"
            className={inputCls}
            {...aria("company")}
          />
          {errorText("company")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.22em] text-background/60 mb-2" htmlFor="lead-email">
            Work email *
          </label>
          <input
            id="lead-email"
            type="email"
            value={values.work_email}
            onChange={(e) => set("work_email", e.target.value)}
            maxLength={200}
            autoComplete="email"
            className={inputCls}
            {...aria("work_email")}
          />
          {errorText("work_email")}
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.22em] text-background/60 mb-2" htmlFor="lead-phone">
            Phone *
          </label>
          <input
            id="lead-phone"
            type="tel"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            maxLength={40}
            autoComplete="tel"
            className={inputCls}
            {...aria("phone")}
          />
          {errorText("phone")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.22em] text-background/60 mb-2" htmlFor="lead-whatsapp">
            WhatsApp (if different)
          </label>
          <input
            id="lead-whatsapp"
            type="tel"
            value={values.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            maxLength={40}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.22em] text-background/60 mb-2" htmlFor="lead-location">
            Site location *
          </label>
          <select
            id="lead-location"
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            className={selectCls}
            {...aria("location")}
          >
            <option value="">Select a location…</option>
            {LEAD_LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {errorText("location")}
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-[0.22em] text-background/60 mb-2" htmlFor="lead-service">
          Service you need *
        </label>
        <select
          id="lead-service"
          value={values.service}
          onChange={(e) => set("service", e.target.value)}
          className={selectCls}
          {...aria("service")}
        >
          <option value="">Select a service…</option>
          {serviceOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errorText("service")}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.22em] text-background/60 mb-2" htmlFor="lead-budget">
            Budget guide
          </label>
          <select
            id="lead-budget"
            value={values.budget_range}
            onChange={(e) => set("budget_range", e.target.value)}
            className={selectCls}
          >
            <option value="">Prefer not to say</option>
            {LEAD_BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.22em] text-background/60 mb-2" htmlFor="lead-timeline">
            Timeline
          </label>
          <select
            id="lead-timeline"
            value={values.timeline}
            onChange={(e) => set("timeline", e.target.value)}
            className={selectCls}
          >
            <option value="">Not set</option>
            {LEAD_TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-[0.22em] text-background/60 mb-2" htmlFor="lead-description">
          What do you need? *
        </label>
        <textarea
          id="lead-description"
          rows={5}
          value={values.project_description}
          onChange={(e) => set("project_description", e.target.value)}
          maxLength={4000}
          placeholder="Site type, number of floors/users, what is failing today, and what you want the outcome to be."
          className={`${inputCls} resize-none`}
          {...aria("project_description")}
        />
        {errorText("project_description")}
      </div>

      {/* Honeypot — hidden from users and screen readers, filled only by bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="lead-website-url">Website</label>
        <input
          id="lead-website-url"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          value={values.honeypot}
          onChange={(e) => setValues((prev) => ({ ...prev, honeypot: e.target.value }))}
        />
      </div>

      <label className="flex items-start gap-3 text-[13px] text-background/75 leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          checked={values.consent}
          onChange={(e) => set("consent", e.target.checked)}
          className="mt-1 h-4 w-4 accent-background"
          {...aria("consent")}
        />
        <span>
          I consent to Siyakha Technology contacting me about this enquiry and storing these details for that
          purpose (POPIA). We never sell or share your information.
        </span>
      </label>
      {errorText("consent")}

      {formError && (
        <p role="alert" className="border border-background/40 px-4 py-3 text-sm text-background">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-4 text-[12px] uppercase tracking-[0.24em] hover:bg-background/90 transition-colors disabled:opacity-50 min-h-[48px]"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {submitting ? "Sending…" : "Request a site assessment"}
      </button>
      <p className="text-xs text-background/55">
        Prefer to talk? Call {CONTACT.phoneDisplay} or WhatsApp {CONTACT.whatsappDisplay}.
      </p>
    </form>
  );
};

export default EnquiryForm;
