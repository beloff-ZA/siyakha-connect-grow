import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import SignaturePad from "@/components/helpdesk/SignaturePad";
import { fetchSignoffCard, submitSignoff, formatDuration, timeOnSiteMinutes, totalKm } from "@/lib/loggedCalls";
import { CheckCircle2, Star } from "lucide-react";

type Card = Record<string, string | number | null>;

const dt = (v?: string | number | null) => (v ? new Date(String(v)).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) : "—");

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="py-2 border-b border-border last:border-0">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-sm mt-0.5 whitespace-pre-wrap">{value || "—"}</p>
  </div>
);

const JobCardSignoff: React.FC = () => {
  const { token = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [items, setItems] = useState<{ description: string; quantity: number; serial_number: string | null }[]>([]);
  const [signed, setSigned] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchSignoffCard(token);
        if (!res?.ok) {
          setError(res?.error || "This sign-off link is not valid.");
        } else {
          setCard(res.card as Card);
          setItems(res.items ?? []);
          setSigned(Boolean(res.already_signed));
        }
      } catch {
        setError("We could not load this job card. Please try the link again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSubmit = async () => {
    setFormError(null);
    if (name.trim().length < 2) return setFormError("Please enter your full name.");
    if (!signature) return setFormError("Please sign in the signature box.");
    if (rating < 1) return setFormError("Please rate the service you received.");
    if (!confirm) return setFormError("Please confirm the work was completed to your satisfaction.");
    setSubmitting(true);
    try {
      const res = await submitSignoff({
        token,
        signed_by_name: name.trim(),
        signed_by_email: email.trim() || undefined,
        signature_data: signature,
        satisfaction_rating: rating,
        signoff_comment: comment.trim() || undefined,
      });
      if (!res?.ok) setFormError(res?.error || "We could not save your sign-off.");
      else setSigned(true);
    } catch {
      setFormError("We could not save your sign-off. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading job card…</div>;

  if (error)
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <h1 className="text-xl font-semibold">Sign-off link unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <p className="mt-4 text-sm">Please contact Siyakha Technology Solutions on 087 723 9183.</p>
      </div>
    );

  const c = card as Card;
  const km = totalKm(c.opening_km as number | null, c.closing_km as number | null);
  const mins = timeOnSiteMinutes(c.arrival_at as string | null, c.departure_at as string | null);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Siyakha Technology Solutions</p>
        <h1 className="text-2xl font-semibold">Service request &amp; customer sign-off</h1>
        <p className="text-sm text-muted-foreground">
          Job card {String(c.call_ref)}
          {c.sit_number ? ` · SIT ${c.sit_number}` : ""}
        </p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Call details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Row label="End customer" value={String(c.end_customer_company ?? "")} />
          <Row label="Contact person" value={[c.end_customer_first_name, c.end_customer_last_name].filter(Boolean).join(" ")} />
          <Row label="Contact number" value={c.contact_number as string} />
          <Row label="Site address" value={[c.site_address, c.city].filter(Boolean).join(", ")} />
          <Row label="Customer logging the call" value={[c.logging_customer, c.customer_order_ref].filter(Boolean).join(" · ")} />
          <Row label="Date logged" value={dt(c.logged_at)} />
          <Row label="Engineer" value={c.engineer_name as string} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fault reported</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Row label="Fault / request as logged" value={c.fault_description as string} />
          <Row label="Work done on site" value={c.fault_solution as string} />
          <Row label="Equipment change control" value={c.change_control as string} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Time and travel</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Row label="Arrival" value={dt(c.arrival_at)} />
          <Row label="Departure" value={dt(c.departure_at)} />
          <Row label="Time on site" value={formatDuration(mins)} />
          <Row label="Kilometres travelled" value={km === null ? "—" : `${km} km`} />
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Additional items used</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {items.map((it, i) => (
              <div key={i} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0 text-sm">
                <span>
                  {it.description}
                  {it.serial_number ? <span className="text-muted-foreground"> · S/N {it.serial_number}</span> : null}
                </span>
                <span className="shrink-0 text-muted-foreground">Qty {it.quantity}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {signed ? (
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-8 w-8" />
            <h2 className="text-lg font-semibold">Thank you — this job card is signed off</h2>
            <p className="text-sm text-muted-foreground">
              Signed by {String(c.signed_by_name ?? name)} on {dt(c.signed_at) === "—" ? "today" : dt(c.signed_at)}.
            </p>
            {c.signature_data && (
              <img src={String(c.signature_data)} alt="Customer signature" className="mx-auto mt-3 max-h-24" />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Customer sign-off</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="signName">Your full name *</Label>
                <Input id="signName" className="min-h-11" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="signEmail">Your email (optional)</Label>
                <Input id="signEmail" type="email" className="min-h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>How satisfied are you with the service? *</Label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} out of 5`}
                    onClick={() => setRating(n)}
                    className="min-h-11 min-w-11 rounded-md border border-border flex items-center justify-center"
                  >
                    <Star className={`h-5 w-5 ${n <= rating ? "fill-current" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="signComment">Comments (optional)</Label>
              <Textarea id="signComment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>

            <div>
              <Label>Signature *</Label>
              <SignaturePad onChange={setSignature} />
            </div>

            <label className="flex items-start gap-3 text-sm">
              <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(Boolean(v))} className="mt-0.5" />
              <span>
                I confirm the work described above was completed at my site and that I am satisfied with the solution
                provided.
              </span>
            </label>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <Button onClick={handleSubmit} disabled={submitting} className="w-full min-h-12">
              {submitting ? "Submitting…" : "Sign off this job card"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Once submitted, this sign-off is final and cannot be changed.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default JobCardSignoff;
