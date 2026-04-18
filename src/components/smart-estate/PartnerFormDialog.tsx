import { useState, ReactNode } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { submitSupportForm } from "@/lib/formSubmission";
import { Loader2 } from "lucide-react";

const partnerSchema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(6, "Contact number is required").max(30),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  project_type: z.string().min(1, "Select a project type"),
  region: z.string().trim().min(2, "Region is required").max(80),
  description: z.string().trim().min(10, "Tell us a bit about the project").max(2000),
});

interface PartnerFormDialogProps {
  trigger: ReactNode;
  defaultSubject?: string;
  /** Heading shown at the top of the dialog */
  title?: string;
  /** Sub-heading shown under the title */
  subtitle?: string;
}

const PartnerFormDialog = ({
  trigger,
  defaultSubject = "Partner with Siyakha Interlink",
  title = "Partner With Us",
  subtitle = "Tell us about your development. We'll respond within one business day.",
}: PartnerFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    project_type: "",
    region: "",
    description: "",
  });

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = partnerSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message ?? "Please complete the form";
      toast({ title: "Check your details", description: first, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitSupportForm({
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        contact_number: parsed.data.phone,
        category: `${defaultSubject} — ${parsed.data.project_type}`,
        description:
          `Project type: ${parsed.data.project_type}\n` +
          `Region: ${parsed.data.region}\n` +
          `Company: ${parsed.data.company || "—"}\n\n` +
          `Project brief:\n${parsed.data.description}`,
        preferred_channel: "email",
      });

      if (result.success) {
        toast({
          title: "Thank you — message received",
          description: "Nikita will be in touch within one business day.",
        });
        setForm({
          full_name: "",
          email: "",
          phone: "",
          company: "",
          project_type: "",
          region: "",
          description: "",
        });
        setOpen(false);
      } else {
        toast({
          title: "Submission failed",
          description: "Please email nikita@siyakhatechnology.co.za directly.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "Please try again or email nikita@siyakhatechnology.co.za.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl bg-background border-foreground/15">
        <DialogHeader>
          <DialogTitle className="font-display font-light text-2xl tracking-tight">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{subtitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name *</Label>
              <Input id="full_name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} maxLength={100} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={form.company} onChange={(e) => update("company", e.target.value)} maxLength={120} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={255} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Contact number *</Label>
              <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={30} required />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="project_type">Project type *</Label>
              <Select value={form.project_type} onValueChange={(v) => update("project_type", v)}>
                <SelectTrigger id="project_type"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residential Development">Residential Development</SelectItem>
                  <SelectItem value="Commercial / Office">Commercial / Office</SelectItem>
                  <SelectItem value="Mixed-Use Estate">Mixed-Use Estate</SelectItem>
                  <SelectItem value="Hospitality / Hotel">Hospitality / Hotel</SelectItem>
                  <SelectItem value="Retail / Mall">Retail / Mall</SelectItem>
                  <SelectItem value="Industrial / Logistics">Industrial / Logistics</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="region">Region / City *</Label>
              <Input id="region" placeholder="e.g. Johannesburg, Dubai, London" value={form.region} onChange={(e) => update("region", e.target.value)} maxLength={80} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Project brief *</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Stage, scale, and what you'd like us to deliver (fibre, surveillance, command centre, tenant tech...)."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              maxLength={2000}
              required
            />
          </div>

          <Button type="submit" disabled={submitting} className="cta-primary w-full">
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
            ) : (
              "Submit Enquiry"
            )}
          </Button>

          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground text-center">
            Goes directly to Nikita · Response within 1 business day
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerFormDialog;
