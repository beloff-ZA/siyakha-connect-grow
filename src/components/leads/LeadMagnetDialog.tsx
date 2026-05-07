import { useState, ReactNode } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { submitSupportForm } from "@/lib/formSubmission";
import { Loader2 } from "lucide-react";

export type LeadMagnetKind =
  | "Free Network Assessment"
  | "Free Security Audit"
  | "Free IT Infrastructure Review"
  | "Free Wi-Fi Performance Check"
  | "Free Site Assessment"
  | "Managed IT Plan — Pricing Request"
  | "Schedule a Consultation";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  company: z.string().trim().min(2, "Company name required").max(120),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().min(7, "Phone required").max(30),
  business_size: z.string().min(1, "Select business size"),
  site_location: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
});

interface Props {
  kind: LeadMagnetKind;
  trigger: ReactNode;
  context?: string;
}

const SIZES = ["1–10 staff", "11–50 staff", "51–200 staff", "200+ staff", "School / Campus", "Multi-site"];

const LeadMagnetDialog = ({ kind, trigger, context }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      full_name: String(fd.get("full_name") || ""),
      company: String(fd.get("company") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      business_size: String(fd.get("business_size") || ""),
      site_location: String(fd.get("site_location") || ""),
      notes: String(fd.get("notes") || ""),
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      toast({
        title: "Please check the form",
        description: parsed.error.issues[0]?.message ?? "Invalid input",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const description =
      `Lead magnet: ${kind}` +
      (context ? `\nContext: ${context}` : "") +
      `\nCompany: ${parsed.data.company}` +
      `\nBusiness size: ${parsed.data.business_size}` +
      (parsed.data.site_location ? `\nSite location: ${parsed.data.site_location}` : "") +
      (parsed.data.notes ? `\n\nNotes:\n${parsed.data.notes}` : "");

    const result = await submitSupportForm({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      contact_number: parsed.data.phone,
      category: kind,
      description,
      preferred_channel: "email",
    });
    setLoading(false);
    if (result.success) {
      toast({
        title: "Request received",
        description: "We'll be in touch within one business day.",
      });
      setOpen(false);
    } else {
      toast({
        title: "Submission issue",
        description: "Please WhatsApp us on 081 501 2993 — we'll respond immediately.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-background border-foreground/15">
        <DialogHeader>
          <DialogTitle className="font-display font-light text-2xl tracking-tight">
            {kind}
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Tell us where you are and we'll respond within one business day. No obligation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" required maxLength={100} />
            </div>
            <div>
              <Label htmlFor="company">Company / Organisation</Label>
              <Input id="company" name="company" required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={255} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" required maxLength={30} />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="business_size">Business size</Label>
              <Select name="business_size" required>
                <SelectTrigger id="business_size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="site_location">Site location (optional)</Label>
              <Input id="site_location" name="site_location" maxLength={200} placeholder="City / Suburb" />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Anything we should know? (optional)</Label>
            <Textarea id="notes" name="notes" maxLength={1000} rows={3} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background py-3 text-sm uppercase tracking-[0.22em] hover:bg-foreground/90 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send Request
          </button>
          <p className="text-[11px] text-foreground/50 text-center">
            Or WhatsApp us directly on 081 501 2993
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadMagnetDialog;