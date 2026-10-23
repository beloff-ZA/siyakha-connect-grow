import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CabinetPhoto } from "../../../supabase/functions/submit-lead/campaignPhoto";
import { CAMPAIGN, CAMPAIGN_SCOPES } from "@/content/decemberCleanup";
import {
  buildCampaignPayload,
  emptyCampaignForm,
  isCampaignOpen,
  minRequestDate,
  readCampaignPhoto,
  validateCampaignForm,
  type CampaignFieldErrors,
  type CampaignFormValues,
} from "@/lib/decemberCampaign";
import { LEAD_LOCATIONS } from "@/lib/leadForm";
import { submitLead } from "@/lib/leadsApi";
import { captureAttribution, getAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";
import { CONTACT } from "@/lib/contact";

/**
 * Guided December 2026 booking-request form. Three short steps; values live
 * only in component state (never localStorage) so errors and back navigation
 * preserve everything without persisting PII. Success shows only after the
 * server confirms a stored lead.
 */
const STEPS = ["Scope & site", "Preferred dates", "Your details"] as const;

const STEP_FIELDS: Record<number, (keyof CampaignFormValues)[]> = {
  0: ["scope", "rack_count", "location", "city"],
  1: ["preferred_date", "alternate_date"],
  2: ["full_name", "company", "work_email", "phone", "notes", "consent"],
};

const DecemberBookingForm = () => {
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<CampaignFormValues>(emptyCampaignForm);
  const [errors, setErrors] = useState<CampaignFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<CabinetPhoto | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoReading, setPhotoReading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | undefined>();
  const photoInput = useRef<HTMLInputElement | null>(null);
  const photoVersion = useRef(0);
  const startedAt = useRef<number | null>(null);
  // Synchronous lock: blocks duplicate submits even before state re-renders.
  const inFlight = useRef(false);

  const minDate = minRequestDate();
  const campaignOpen = isCampaignOpen();

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  const choosePhoto = async (file?: File) => {
    if (!file || inFlight.current) return;
    const version = ++photoVersion.current;
    setPhotoReading(true);
    setPhotoError(null);
    setPhoto(null);
    setPhotoPreview(null);
    try {
      const validated = await readCampaignPhoto(file);
      if (version !== photoVersion.current) return;
      setPhoto(validated);
      setPhotoPreview(URL.createObjectURL(file));
    } catch (error) {
      if (version === photoVersion.current) setPhotoError(error instanceof Error ? error.message : "Could not read the photo. Please try again.");
    } finally {
      if (version === photoVersion.current) setPhotoReading(false);
    }
  };

  const set = <K extends keyof CampaignFormValues>(key: K, value: CampaignFormValues[K]) => {
    if (startedAt.current === null) startedAt.current = Date.now();
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = (index: number): boolean => {
    const all = validateCampaignForm(values);
    const keys = STEP_FIELDS[index];
    const stepErrors: CampaignFieldErrors = {};
    keys.forEach((k) => {
      if (all[k]) stepErrors[k] = all[k];
    });
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return { ...next, ...stepErrors };
    });
    return Object.keys(stepErrors).length === 0;
  };

  const next = () => {
    if (step === 0 && (!photo || photoReading)) {
      setPhotoError("Add one cabinet photo before continuing.");
      validateStep(step);
      return;
    }
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current || submitted || photoReading) return;
    if (!photo) { setPhotoError("Add one cabinet photo before requesting a quote."); setStep(0); return; }
    const all = validateCampaignForm(values);
    setErrors(all);
    if (Object.keys(all).length) {
      setFormError("Please correct the highlighted fields.");
      // Jump back to the first step that has an error.
      const firstBad = STEPS.findIndex((_, i) => STEP_FIELDS[i].some((k) => all[k]));
      if (firstBad >= 0) setStep(firstBad);
      return;
    }
    setFormError(null);
    inFlight.current = true;
    setSubmitting(true);
    const payload = { ...buildCampaignPayload(values, getAttribution(), {
      pagePath: `${location.pathname}${location.search}`,
      formStartedAt: startedAt.current,
    }), cabinet_photo: photo };
    const result = await submitLead(payload);
    inFlight.current = false;
    setSubmitting(false);

    if (!result.ok) {
      // Values stay in state — nothing is lost on API or network failure.
      setFormError(
        result.error ??
          `Something went wrong. Please call ${CONTACT.phoneDisplay} or WhatsApp ${CONTACT.whatsappDisplay}.`,
      );
      toast.error("We could not store your photo quote request — please try again or call us.");
      return;
    }

    if (!result.duplicate) {
      trackEvent("generate_lead", {
        lead_id: result.leadId,
        service: CAMPAIGN.service,
        lead_location: values.location,
        timeline: values.preferred_date,
        currency: "ZAR",
        value: 0,
      });
    }
    setSubmitted(true);
    setNotificationStatus(result.notificationStatus);
    toast.success("Thanks — your cabinet photo quote request is stored.");
  };

  const inputCls =
    "w-full border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none transition-colors min-h-[44px] rounded-sm";
  const selectCls = `${inputCls} [color-scheme:light]`;
  const labelCls = "block text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2";

  const errorText = (key: keyof CampaignFormValues) =>
    errors[key] ? (
      <p id={`dec-${key}-error`} role="alert" className="mt-1 text-xs text-destructive">
        {errors[key]}
      </p>
    ) : null;

  const aria = (key: keyof CampaignFormValues) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `dec-${key}-error` : undefined,
  });

  if (submitted) {
    return (
      <div role="status" aria-live="polite" className="border border-accent/30 bg-card p-8 rounded-sm">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent mb-4">Photo quote request stored</p>
        <h3 className="font-display font-light text-2xl md:text-3xl leading-snug text-foreground">
          Thank you — we have your cabinet photo and quote request.
        </h3>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Siyakha will contact you to confirm scope, quotation and availability. If it is urgent, call{" "}
          <a className="underline" href={`tel:${CONTACT.phoneE164}`}>
            {CONTACT.phoneDisplay}
          </a>{" "}
          or WhatsApp {CONTACT.whatsappDisplay}.
        </p>
        {notificationStatus !== "sent" && (
          <p className="mt-3 text-sm text-muted-foreground">
            Your request and photo are saved, but email notification to the full quote team is not confirmed.
            Please call or WhatsApp us if you need prompt assistance.
          </p>
        )}
        {notificationStatus === "sent" && <p className="mt-3 text-xs text-muted-foreground">Quote-team notifications accepted for sending; inbox delivery is not confirmed.</p>}
      </div>
    );
  }

  if (!campaignOpen) {
    return (
      <div className="border border-border bg-card p-8 rounded-sm">
        <h3 className="font-display font-light text-2xl leading-snug text-foreground">
          December 2026 bookings have closed.
        </h3>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          We still handle cabinet clean-ups and network maintenance year-round — call{" "}
          <a className="underline" href={`tel:${CONTACT.phoneE164}`}>
            {CONTACT.phoneDisplay}
          </a>{" "}
          or WhatsApp {CONTACT.whatsappDisplay} and we'll help.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div aria-live="polite" className="sr-only">
        {submitting ? "Sending your photo quote request" : ""}
      </div>

      {/* Step indicator */}
      <ol className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                i === step
                  ? "border-accent bg-accent text-accent-foreground"
                  : i < step
                    ? "border-accent/50 text-accent"
                    : "border-border"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              {i + 1}
            </span>
            <span className={i === step ? "text-foreground" : "hidden sm:inline"}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-border" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset className="space-y-5">
          <legend className="sr-only">Scope and site</legend>
          <div>
            <p className={labelCls} id="dec-scope-label">
              What do you need done? *
            </p>
            {/* Native radio inputs: full keyboard support (arrows move selection). */}
            <div role="radiogroup" aria-labelledby="dec-scope-label" className="grid gap-2 sm:grid-cols-3">
              {CAMPAIGN_SCOPES.map((scope) => {
                const active = values.scope === scope;
                return (
                  <label
                    key={scope}
                    className={`relative flex items-center border px-4 py-4 text-left text-sm rounded-sm transition-colors min-h-[56px] cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                      active
                        ? "border-accent bg-accent/5 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="dec-scope"
                      value={scope}
                      checked={active}
                      onChange={() => set("scope", scope)}
                      className="sr-only"
                    />
                    {scope}
                  </label>
                );
              })}
            </div>
            {errorText("scope")}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="dec-racks">
                Cabinets / racks (optional)
              </label>
              <input
                id="dec-racks"
                inputMode="numeric"
                value={values.rack_count}
                onChange={(e) => set("rack_count", e.target.value)}
                placeholder="e.g. 2"
                className={inputCls}
                {...aria("rack_count")}
              />
              {errorText("rack_count")}
            </div>
            <div>
              <label className={labelCls} htmlFor="dec-region">
                Site region *
              </label>
              <select
                id="dec-region"
                value={values.location}
                onChange={(e) => set("location", e.target.value)}
                className={selectCls}
                {...aria("location")}
              >
                <option value="">Select a region…</option>
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
            <label className={labelCls} htmlFor="dec-city">
              City / suburb *
            </label>
            <input
              id="dec-city"
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
              maxLength={120}
              placeholder="e.g. Umhlanga, Sandton CBD"
              className={inputCls}
              {...aria("city")}
            />
            {errorText("city")}
          </div>
          <div>
            <label className={labelCls} htmlFor="dec-photo">Cabinet photo *</label>
            <input ref={photoInput} id="dec-photo" type="file" accept="image/jpeg,image/png,image/webp"
              disabled={submitting || photoReading} className="sr-only" aria-describedby="dec-photo-help"
              onChange={(event) => { void choosePhoto(event.target.files?.[0]); event.target.value = ""; }} />
            <Button type="button" variant="outline" disabled={submitting || photoReading}
              onClick={() => photoInput.current?.click()} className="min-h-[48px] h-auto whitespace-normal rounded-sm">
              {photoReading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
              {photoReading ? "Checking photo…" : photo ? "Replace cabinet photo" : "Choose cabinet photo"}
            </Button>
            <p id="dec-photo-help" className="mt-2 text-xs text-muted-foreground">One JPG, PNG or WebP, up to 5MB. Choose from your camera or photo library.</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{CAMPAIGN.photoPrivacy}</p>
            {photoPreview && <div className="mt-3 flex items-start gap-3">
              <img src={photoPreview} alt="Selected cabinet photo" className="h-36 w-48 max-w-[70%] object-contain border border-border rounded-sm" />
              <Button type="button" variant="outline" size="icon" aria-label="Remove cabinet photo" title="Remove cabinet photo" disabled={submitting}
                onClick={() => { photoVersion.current++; setPhoto(null); setPhotoPreview(null); setPhotoError(null); }}><Trash2 /></Button>
            </div>}
            {photoError && <p role="alert" className="mt-2 text-xs text-destructive">{photoError}</p>}
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="space-y-5">
          <legend className="sr-only">Preferred dates</legend>
          <p className="text-sm text-muted-foreground leading-relaxed border border-border bg-secondary/60 px-4 py-3 rounded-sm">
            {CAMPAIGN.dateDisclaimer}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="dec-preferred">
                Preferred date — {CAMPAIGN.monthLabel} *
              </label>
              <input
                id="dec-preferred"
                type="date"
                min={minDate}
                max={CAMPAIGN.maxDate}
                value={values.preferred_date}
                onChange={(e) => set("preferred_date", e.target.value)}
                className={selectCls}
                {...aria("preferred_date")}
              />
              {errorText("preferred_date")}
            </div>
            <div>
              <label className={labelCls} htmlFor="dec-alternate">
                Alternate date (optional)
              </label>
              <input
                id="dec-alternate"
                type="date"
                min={minDate}
                max={CAMPAIGN.maxDate}
                value={values.alternate_date}
                onChange={(e) => set("alternate_date", e.target.value)}
                className={selectCls}
                {...aria("alternate_date")}
              />
              {errorText("alternate_date")}
            </div>
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="space-y-4">
          <legend className="sr-only">Your details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="dec-name">
                Full name *
              </label>
              <input
                id="dec-name"
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
              <label className={labelCls} htmlFor="dec-company">
                Company / organisation
              </label>
              <input
                id="dec-company"
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
              <label className={labelCls} htmlFor="dec-email">
                Email *
              </label>
              <input
                id="dec-email"
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
              <label className={labelCls} htmlFor="dec-phone">
                Phone *
              </label>
              <input
                id="dec-phone"
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

          <div>
            <label className={labelCls} htmlFor="dec-notes">
              Anything we should know? (optional)
            </label>
            <textarea
              id="dec-notes"
              rows={3}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              maxLength={1500}
              placeholder="Access times, floor, current issues…"
              className={`${inputCls} resize-none`}
              {...aria("notes")}
            />
            {errorText("notes")}
          </div>

          {/* Honeypot — hidden from users and screen readers, filled only by bots. */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="dec-website-url">Website</label>
            <input
              id="dec-website-url"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={values.honeypot}
              onChange={(e) => setValues((prev) => ({ ...prev, honeypot: e.target.value }))}
            />
          </div>

          <label className="flex items-start gap-3 text-[13px] text-muted-foreground leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={values.consent}
              onChange={(e) => set("consent", e.target.checked)}
              className="mt-1 h-4 w-4 accent-accent"
              {...aria("consent")}
            />
            <span>
              I consent to my details, request and cabinet photo being stored and sent to the Siyakha quote team at
              nikita@siyakhatechnology.co.za and Ben@siyakhatechnology.co.za for assessment and contact about my quote (POPIA).
            </span>
          </label>
          {errorText("consent")}
        </fieldset>
      )}

      {formError && (
        <p role="alert" className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-foreground rounded-sm">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button
            type="button"
            onClick={back}
            disabled={submitting}
            className="inline-flex items-center gap-2 border border-foreground/30 text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/[0.06] transition-colors min-h-[48px] rounded-sm disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-accent-hover transition-colors min-h-[48px] rounded-sm"
          >
            Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={submitting || photoReading}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 text-[12px] uppercase tracking-[0.24em] hover:bg-accent-hover transition-colors disabled:opacity-50 min-h-[48px] rounded-sm"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {submitting ? "Sending…" : CAMPAIGN.cta}
          </Button>
        )}
      </div>
      {step === STEPS.length - 1 && (
        <p className="text-xs text-muted-foreground">
          {CAMPAIGN.ctaFollow} Prefer to talk? Call {CONTACT.phoneDisplay} or WhatsApp{" "}
          {CONTACT.whatsappDisplay}.
        </p>
      )}
    </form>
  );
};

export default DecemberBookingForm;
