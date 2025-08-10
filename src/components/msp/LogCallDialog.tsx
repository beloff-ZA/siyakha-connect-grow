import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const issueOptions = [
  { key: "computer", label: "Computer Issues – Software errors, slow performance, setup help" },
  { key: "printer", label: "Printer Problems – Paper jams, connectivity, configuration" },
  { key: "network", label: "Network & Wi‑Fi – Connection drops, slow speeds, setup" },
  { key: "server", label: "Server & Cloud – Downtime, storage, security" },
  { key: "other", label: "Other – Please describe below" },
] as const;

type IssueKey = typeof issueOptions[number]["key"];

interface LogCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

export default function LogCallDialog({ open, onOpenChange, onSubmitted }: LogCallDialogProps) {
  const { toast } = useToast();

  const [sites, setSites] = useState<string[]>([]);
  const [siteInput, setSiteInput] = useState("");
  const [issues, setIssues] = useState<IssueKey[]>([]);
  const [description, setDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Prefill contact from session
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setEmail((prev) => prev || user.email || "");
          if (!fullName) {
            const guess = (user.user_metadata?.full_name as string) || (user.email ? user.email.split("@")[0] : "");
            setFullName(guess);
          }
        }
      });
    }
  }, [open, fullName]);

  const canSubmit = useMemo(() => sites.length > 0 && issues.length > 0 && description.trim().length > 5, [sites, issues, description]);

  const addSite = () => {
    const s = siteInput.trim();
    if (!s) return;
    setSites((prev) => Array.from(new Set([...prev, s])));
    setSiteInput("");
  };
  const removeSite = (s: string) => setSites((prev) => prev.filter((x) => x !== s));

  const toggleIssue = (key: IssueKey) => {
    setIssues((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const reset = () => {
    setSites([]);
    setSiteInput("");
    setIssues([]);
    setDescription("");
    setFullName("");
    setEmail("");
    setPhone("");
  };

  const submit = async () => {
    if (!canSubmit) {
      toast({ title: "Complete required fields", description: "Add at least one site, select issues and describe the problem.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to log a call.");

      // Insert one ticket per site
      const payload = sites.map((location) => ({
        user_id: user.id,
        client_status: "registered",
        location,
        issues,
        description,
        contact_name: fullName || null,
        contact_email: email || null,
        contact_phone: phone || null,
        status: "open",
      }));

      const { error } = await supabase.from("support_calls").insert(payload);
      if (error) throw error;

      toast({ title: "Call logged", description: `${payload.length} ticket${payload.length > 1 ? "s" : ""} created successfully.` });
      onOpenChange(false);
      onSubmitted?.();
      reset();
    } catch (e: any) {
      toast({ title: "Could not log call", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) onOpenChange(o); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log a Support Call</DialogTitle>
          <DialogDescription>Submit one or more tickets. Add multiple sites if needed.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Sites */}
          <div>
            <Label>Sites</Label>
            <div className="flex gap-2 mt-2">
              <Input placeholder="e.g. Johannesburg Office" value={siteInput} onChange={(e) => setSiteInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSite(); } }} />
              <Button type="button" onClick={addSite}>Add</Button>
            </div>
            {sites.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {sites.map((s) => (
                  <span key={s} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm">
                    {s}
                    <button type="button" onClick={() => removeSite(s)} className="text-muted-foreground hover:underline">Remove</button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Add each site where the problem occurs.</p>
          </div>

          {/* Issues */}
          <div>
            <Label>Issues</Label>
            <div className="grid gap-2 mt-2">
              {issueOptions.map((opt) => (
                <label key={opt.key} className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer">
                  <Checkbox checked={issues.includes(opt.key)} onCheckedChange={() => toggleIssue(opt.key)} className="mt-1" />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the problem in detail..." />
          </div>

          {/* Contact */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="button" onClick={submit} disabled={!canSubmit || loading} className="cta-primary">Log Call</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
