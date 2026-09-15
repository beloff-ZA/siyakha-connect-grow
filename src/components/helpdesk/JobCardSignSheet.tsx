import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import SignaturePad from "@/components/helpdesk/SignaturePad";
import { CheckCircle2, Star, X } from "lucide-react";
import { submitSignoff, type LoggedCall, type LoggedCallItem } from "@/lib/loggedCalls";
import { JOB_CARD_SHEET_CSS, jobCardSheetHtml } from "@/lib/jobCardSheet";

type Props = {
  call: LoggedCall;
  items: LoggedCallItem[];
  onClose: () => void;
  onSigned: () => void;
};

const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const localTime = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/**
 * Hand-the-device-over signing. Shows the full Satio sheet with the sign-off
 * block turned into live inputs so the customer signs on the sheet itself.
 */
const JobCardSignSheet: React.FC<Props> = ({ call, items, onClose, onSigned }) => {
  const now = useMemo(() => new Date(), []);
  const [first, setFirst] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(localDate(now));
  const [time, setTime] = useState(localTime(now));
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const sheet = useMemo(
    () =>
      jobCardSheetHtml(call as unknown as Record<string, unknown>, items, {
        signBlock: "omit",
      }),
    [call, items],
  );

  const submit = async () => {
    setError(null);
    if (first.trim().length < 2) return setError("Please enter the customer's first name.");
    if (surname.trim().length < 2) return setError("Please enter the customer's surname.");
    if (!signature) return setError("Please sign in the signature box.");
    if (rating < 1) return setError("Please rate the service received.");
    if (!confirm) return setError("Please confirm the work was completed to your satisfaction.");
    const stamp = new Date(`${date}T${time || "00:00"}`);
    if (Number.isNaN(stamp.getTime())) return setError("Please check the sign-off date and time.");

    setBusy(true);
    try {
      const res = await submitSignoff({
        token: call.signoff_token,
        signed_by_name: `${first.trim()} ${surname.trim()}`,
        signed_by_email: email.trim() || undefined,
        signature_data: signature,
        satisfaction_rating: rating,
        signoff_comment: comment.trim() || undefined,
        signed_at: stamp.toISOString(),
      });
      if (!res?.ok) setError(res?.error || "Could not save the sign-off.");
      else {
        setDone(true);
        onSigned();
      }
    } catch {
      setError("Could not save the sign-off. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <style>{JOB_CARD_SHEET_CSS}</style>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3 print:hidden">
        <p className="text-sm font-medium">
          Customer sign-off — {call.sit_number ? `SIT ${call.sit_number}` : call.call_ref}
        </p>
        <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto min-h-11">
          <X className="h-4 w-4 mr-1" />
          Close
        </Button>
      </div>

      <div className="mx-auto max-w-3xl px-3 py-4 space-y-5">
        <div className="overflow-x-auto rounded-md border border-border bg-white p-3">
          <div dangerouslySetInnerHTML={{ __html: sheet }} />
        </div>

        {done ? (
          <div className="rounded-md border border-border p-6 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-8 w-8" />
            <h2 className="text-lg font-semibold">Thank you — this job card is signed off</h2>
            <p className="text-sm text-muted-foreground">
              A copy of the completed sheet has been emailed to the client and to Siyakha.
            </p>
            <Button onClick={onClose} className="min-h-11 mt-2">
              Done
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-border p-4 space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wide">Customer sign-off</p>
              <p className="text-xs text-muted-foreground">
                and satisfaction pertaining to the above fault solution
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="sgFirst">First name *</Label>
                <Input id="sgFirst" className="min-h-11" value={first} onChange={(e) => setFirst(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sgLast">Surname *</Label>
                <Input id="sgLast" className="min-h-11" value={surname} onChange={(e) => setSurname(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sgDate">Date *</Label>
                <Input id="sgDate" type="date" className="min-h-11" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sgTime">Time *</Label>
                <Input id="sgTime" type="time" className="min-h-11" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="sgEmail">Email (optional — to receive a copy)</Label>
                <Input id="sgEmail" type="email" className="min-h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Satisfaction with the service *</Label>
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
              <Label htmlFor="sgComment">Comments (optional)</Label>
              <Textarea id="sgComment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>

            <div>
              <Label>Signature *</Label>
              <SignaturePad onChange={setSignature} height={200} />
            </div>

            <label className="flex items-start gap-3 text-sm">
              <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(Boolean(v))} className="mt-0.5" />
              <span>
                I confirm the work described on this sheet was completed at my site and I am satisfied with the
                solution provided.
              </span>
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button onClick={submit} disabled={busy} className="w-full min-h-12">
              {busy ? "Saving…" : "Sign off this job card"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Once submitted this sign-off is final and cannot be changed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCardSignSheet;
