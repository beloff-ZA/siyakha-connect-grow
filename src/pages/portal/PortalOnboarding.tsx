import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { PageHeader, Panel, ErrorNote } from "@/components/portal/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DOCUMENTS_BUCKET } from "@/lib/portalFiles";

const SERVICES = [
  { value: "cctv", label: "CCTV / surveillance" },
  { value: "wifi", label: "Wi-Fi" },
  { value: "lan", label: "LAN / network" },
  { value: "fibre", label: "Fibre" },
  { value: "access_control", label: "Access control" },
  { value: "structured_cabling", label: "Structured cabling" },
];

const STEPS = [
  "Verified account",
  "Organisation",
  "First site",
  "Address & contact",
  "Services",
  "Upload plans",
  "Floors / pages",
  "Collaborators",
  "Submit for review",
];

const ALLOWED = ["application/pdf", "image/png", "image/jpeg"];
const MAX_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 12;

const PortalOnboarding: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    organisation_name: "",
    parent_reference: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    site_name: "",
    site_address: "",
    site_city: "",
    site_province: "",
    site_postal_code: "",
    venue_type: "",
    notes: "",
  });
  const [services, setServices] = useState<string[]>([]);
  const [pages, setPages] = useState("Ground floor");
  const [collaborators, setCollaborators] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    document.title = "Onboard a new site | Siyakha Connect";
    if (user?.email) setForm((f) => ({ ...f, contact_email: f.contact_email || user.email! }));
  }, [user]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const emailVerified = !!user?.email_confirmed_at;

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return !!user;
      case 1:
        return form.organisation_name.trim().length > 1;
      case 2:
        return form.site_name.trim().length > 1;
      case 3:
        return form.site_address.trim().length > 3 && form.contact_email.trim().includes("@");
      case 4:
        return services.length > 0;
      case 5:
        return true;
      case 6:
        return pages.trim().length > 0;
      default:
        return true;
    }
  }, [step, user, form, services, pages]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next: File[] = [];
    for (const f of Array.from(list)) {
      if (!ALLOWED.includes(f.type)) {
        setError(`${f.name}: only PDF, PNG and JPG plans are accepted.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        setError(`${f.name}: exceeds the 25 MB upload limit.`);
        continue;
      }
      if (files.some((x) => x.name === f.name && x.size === f.size)) {
        setError(`${f.name}: duplicate file skipped.`);
        continue;
      }
      next.push(f);
    }
    setFiles((prev) => [...prev, ...next].slice(0, MAX_FILES));
  };

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const paths: string[] = [];
      for (const f of files) {
        const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `onboarding/${user.id}/${Date.now()}-${safe}`;
        const { error: upErr } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, f, {
          contentType: f.type,
          upsert: false,
        });
        if (upErr) throw upErr;
        paths.push(path);
      }

      const { error: insErr } = await supabase.from("portal_registrations").insert({
        submitted_by: user.id,
        organisation_name: form.organisation_name.trim(),
        parent_reference: form.parent_reference.trim() || null,
        contact_name: form.contact_name.trim() || null,
        contact_email: form.contact_email.trim().toLowerCase(),
        contact_phone: form.contact_phone.trim() || null,
        site_name: form.site_name.trim(),
        site_address: form.site_address.trim(),
        site_city: form.site_city.trim() || null,
        site_province: form.site_province.trim() || null,
        site_postal_code: form.site_postal_code.trim() || null,
        venue_type: form.venue_type.trim() || null,
        services,
        page_labels: pages.split(/[,\n]/).map((s) => s.trim()).filter(Boolean),
        collaborators: collaborators.split(/[,\n\s]+/).map((s) => s.trim()).filter((s) => s.includes("@")),
        plan_paths: paths,
        notes: form.notes.trim() || null,
        status: "pending_review",
      });
      if (insErr) throw insErr;

      setSubmitted(true);
      toast({
        title: "Submitted for review",
        description: "Siyakha will review your site and plans and activate the project.",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <PortalLayout>
        <PageHeader eyebrow="Siyakha Connect" title="Pending review" />
        <Panel>
          <p className="text-sm leading-relaxed">
            <strong>{form.organisation_name}</strong> and the site <strong>{form.site_name}</strong> have been submitted
            to Siyakha for review. Your account stays in <em>Pending review</em> until a Siyakha administrator approves
            the organisation and activates the project workspace. You will be notified by email.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => navigate("/portal")}>
              Back to portal
            </Button>
          </div>
        </Panel>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <PageHeader
        eyebrow="Siyakha Connect"
        title="Onboard a new site"
        description="Nine short steps: create your organisation, add your first site, choose the services you need, upload plans and submit the project for Siyakha review."
      />

      <ol className="flex flex-wrap gap-2 mb-8" aria-label="Onboarding progress">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={[
              "flex items-center gap-2 border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em]",
              i === step
                ? "border-foreground bg-foreground text-background"
                : i < step
                  ? "border-border text-muted-foreground"
                  : "border-border/60 text-muted-foreground/60",
            ].join(" ")}
          >
            {i < step && <Check className="h-3 w-3" strokeWidth={2} />}
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {error && <ErrorNote message={error} />}

      <Panel title={`Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`} className="mt-6">
        {step === 0 && (
          <div className="space-y-3 text-sm">
            <p>
              Signed in as <strong>{user?.email}</strong>.
            </p>
            <p className={emailVerified ? "text-muted-foreground" : "text-destructive"}>
              {emailVerified
                ? "Your email address is verified."
                : "Your email address is not verified yet. Check your inbox for the Siyakha verification link — you can continue, but Siyakha will verify it before approving the organisation."}
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="org">Organisation name</Label>
              <Input id="org" value={form.organisation_name} onChange={set("organisation_name")} />
            </div>
            <div>
              <Label htmlFor="parent">Parent / customer reference (optional)</Label>
              <Input id="parent" value={form.parent_reference} onChange={set("parent_reference")} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="site">Site name</Label>
              <Input id="site" value={form.site_name} onChange={set("site_name")} />
            </div>
            <div>
              <Label htmlFor="venue">Venue type</Label>
              <Input id="venue" value={form.venue_type} onChange={set("venue_type")} placeholder="e.g. retail store, school, venue" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="addr">Street address</Label>
              <Input id="addr" value={form.site_address} onChange={set("site_address")} />
            </div>
            <div>
              <Label htmlFor="city">City / town</Label>
              <Input id="city" value={form.site_city} onChange={set("site_city")} />
            </div>
            <div>
              <Label htmlFor="prov">Province</Label>
              <Input id="prov" value={form.site_province} onChange={set("site_province")} />
            </div>
            <div>
              <Label htmlFor="post">Postal code</Label>
              <Input id="post" value={form.site_postal_code} onChange={set("site_postal_code")} />
            </div>
            <div>
              <Label htmlFor="cname">Site contact name</Label>
              <Input id="cname" value={form.contact_name} onChange={set("contact_name")} />
            </div>
            <div>
              <Label htmlFor="cmail">Contact email</Label>
              <Input id="cmail" type="email" value={form.contact_email} onChange={set("contact_email")} />
            </div>
            <div>
              <Label htmlFor="cphone">Contact phone</Label>
              <Input id="cphone" value={form.contact_phone} onChange={set("contact_phone")} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {SERVICES.map((s) => {
              const on = services.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setServices((prev) => (on ? prev.filter((v) => v !== s.value) : [...prev, s.value]))
                  }
                  className={[
                    "flex items-center justify-between border px-4 py-3 text-sm text-left transition-colors",
                    on ? "border-foreground bg-muted" : "border-border hover:bg-muted/60",
                  ].join(" ")}
                >
                  {s.label}
                  {on && <Check className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              );
            })}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload PDF, PNG or JPG plans (max 25 MB each, {MAX_FILES} files). Multi-page PDFs are supported — Siyakha
              splits and orients the pages during review. Originals are preserved in private storage.
            </p>
            <label className="flex items-center gap-3 border border-dashed border-border px-5 py-6 cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-sm">Choose plan files</span>
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                className="sr-only"
                onChange={(e) => addFiles(e.target.files)}
              />
            </label>
            {files.length > 0 && (
              <ul className="text-sm space-y-1">
                {files.map((f) => (
                  <li key={f.name} className="flex items-center justify-between border border-border px-3 py-2">
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 6 && (
          <div>
            <Label htmlFor="pages">Floors / plan pages</Label>
            <Textarea
              id="pages"
              rows={4}
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="One per line, e.g. Ground floor, First floor, Rooftop"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Separate names with commas or new lines. Siyakha maps each name to a plan page during review.
            </p>
          </div>
        )}

        {step === 7 && (
          <div>
            <Label htmlFor="collab">Colleague email addresses</Label>
            <Textarea
              id="collab"
              rows={3}
              value={collaborators}
              onChange={(e) => setCollaborators(e.target.value)}
              placeholder="colleague@example.co.za"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Siyakha sends secure invitations to these addresses once the organisation is approved.
            </p>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Organisation</dt>
                <dd>{form.organisation_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Site</dt>
                <dd>{form.site_name || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Address</dt>
                <dd>
                  {[form.site_address, form.site_city, form.site_postal_code, form.site_province]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Services</dt>
                <dd>{services.map((s) => SERVICES.find((x) => x.value === s)?.label).join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Plans</dt>
                <dd>{files.length} file(s)</dd>
              </div>
            </dl>
            <div>
              <Label htmlFor="notes">Anything else Siyakha should know?</Label>
              <Textarea id="notes" rows={3} value={form.notes} onChange={set("notes")} />
            </div>
            <p className="text-xs text-muted-foreground">
              Your submission stays in <strong>Pending review</strong> until a Siyakha administrator approves it.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || busy}>
            <ChevronLeft className="h-4 w-4 mr-1" strokeWidth={1.5} /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!stepValid || busy}>
              Continue <ChevronRight className="h-4 w-4 ml-1" strokeWidth={1.5} />
            </Button>
          ) : (
            <Button onClick={submit} disabled={busy}>
              {busy ? "Submitting…" : "Submit to Siyakha"}
            </Button>
          )}
        </div>
      </Panel>
    </PortalLayout>
  );
};

export default PortalOnboarding;
