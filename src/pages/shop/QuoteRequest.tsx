import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  company: z.string().trim().max(200).optional().or(z.literal("")),
  contactName: z.string().trim().min(2, "Enter your name").max(200),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().min(6, "Enter a phone number").max(60),
  vatNumber: z.string().trim().max(60).optional().or(z.literal("")),
  poNumber: z.string().trim().max(100).optional().or(z.literal("")),
  billingAddress: z.string().trim().min(5, "Billing address is required").max(1000),
  deliveryAddress: z.string().trim().max(1000).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  needSupport: z.boolean().default(false),
});


type FormState = z.infer<typeof schema>;

const initial: FormState = {
  company: "", contactName: "", email: "", phone: "",
  vatNumber: "", poNumber: "",
  billingAddress: "", deliveryAddress: "", notes: "",
  needSupport: false,
};


const QuoteRequest = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const currency = items[0]?.price.currencyCode || "ZAR";
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0),
    [items],
  );

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { map[i.path[0] as string] = i.message; });
      setErrors(map);
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const payload = {
        customer: parsed.data,
        items: items.map((i) => ({
          title: i.product.node.title,
          variantTitle: i.variantTitle,
          quantity: i.quantity,
          unitPrice: parseFloat(i.price.amount),
          currency: i.price.currencyCode,
          options: i.selectedOptions,
        })),
      };
      const { data, error } = await supabase.functions.invoke("send-quote-request", { body: payload });
      if (error) throw error;
      if (data && (data as any).error) throw new Error((data as any).error);
      setSent(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("We couldn't send your request. Please try again or email accounts@siyakhatechnology.co.za");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SiteSEO
        title="Request a Quote — Siyakha Technology"
        description="Submit your billing details and Siyakha Technology will send you an official quote for the hardware in your cart."
        path="/shop/quote"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="container mx-auto px-6 lg:px-10 pt-10 pb-6">
            <Link to="/shop" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to shop
            </Link>
          </section>

          <section className="container mx-auto px-6 lg:px-10 pb-6">
            <p className="overline text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-4">Quote Request</p>
            <h1 className="font-display font-light text-4xl md:text-5xl tracking-[-0.02em] leading-[1.02]">
              Complete your <span className="italic">billing details</span>.
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-2xl">
              Once submitted, Eshlan from our accounts team receives your request and prepares an official quote. Payment is arranged after you approve the quote.
            </p>
          </section>

          {sent ? (
            <section className="container mx-auto px-6 lg:px-10 py-16">
              <div className="max-w-2xl mx-auto border border-border p-10 text-center">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-4" strokeWidth={1.25} />
                <h2 className="font-display text-3xl font-light mb-3">Request received.</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  A confirmation was sent to your email. Eshlan will follow up with an official quote shortly. For urgent enquiries call 081 501 2993.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={() => navigate("/shop")} className="rounded-none bg-foreground text-background hover:bg-foreground/90 text-[11px] uppercase tracking-[0.24em] h-11 px-6">
                    Continue browsing
                  </Button>
                  <Button onClick={() => navigate("/")} variant="outline" className="rounded-none border-foreground text-[11px] uppercase tracking-[0.24em] h-11 px-6">
                    Back home
                  </Button>
                </div>
              </div>
            </section>
          ) : (
            <section className="container mx-auto px-6 lg:px-10 pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <form onSubmit={submit} className="lg:col-span-2 space-y-6" noValidate>
                  <div className="border-t border-border pt-6">
                    <h3 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-4">Company & contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Company" value={form.company || ""} onChange={set("company")} error={errors.company} placeholder="(optional)" />
                      <Field label="Contact name *" value={form.contactName} onChange={set("contactName")} error={errors.contactName} />
                      <Field label="Email *" type="email" value={form.email} onChange={set("email")} error={errors.email} />
                      <Field label="Phone *" value={form.phone} onChange={set("phone")} error={errors.phone} />
                      <Field label="VAT number" value={form.vatNumber || ""} onChange={set("vatNumber")} error={errors.vatNumber} placeholder="(optional)" />
                      <Field label="PO number" value={form.poNumber || ""} onChange={set("poNumber")} error={errors.poNumber} placeholder="(optional)" />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-4">Addresses</h3>
                    <div className="space-y-4">
                      <AreaField label="Billing address *" value={form.billingAddress} onChange={set("billingAddress")} error={errors.billingAddress} rows={3} placeholder="Street, suburb, city, postal code" />
                      <AreaField label="Delivery address" value={form.deliveryAddress || ""} onChange={set("deliveryAddress")} error={errors.deliveryAddress} rows={3} placeholder="(leave blank if same as billing)" />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-4">Notes for Eshlan</h3>
                    <AreaField label="Anything we should know?" value={form.notes || ""} onChange={set("notes")} error={errors.notes} rows={4} placeholder="Timelines, installation requirements, project reference, etc." />
                  </div>

                  <Button type="submit" disabled={submitting || items.length === 0} className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 text-[11px] uppercase tracking-[0.24em] h-12">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send quote request"}
                  </Button>
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center">Your cart is empty — <Link to="/shop" className="underline">add products first</Link>.</p>
                  )}
                </form>

                <aside className="lg:col-span-1">
                  <div className="border border-border p-6 sticky top-24">
                    <h3 className="font-display text-lg mb-4">Your items</h3>
                    {items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nothing in your cart yet.</p>
                    ) : (
                      <>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 mb-4">
                          {items.map((i) => (
                            <div key={i.variantId} className="flex justify-between text-sm gap-4 pb-3 border-b border-border last:border-b-0">
                              <div className="min-w-0">
                                <p className="truncate">{i.product.node.title}</p>
                                {i.selectedOptions.length > 0 && (
                                  <p className="text-xs text-muted-foreground">{i.selectedOptions.map((o) => o.value).join(" · ")}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">Qty {i.quantity}</p>
                              </div>
                              <div className="text-right whitespace-nowrap">
                                {formatPrice((parseFloat(i.price.amount) * i.quantity).toFixed(2), i.price.currencyCode)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t border-foreground">
                          <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Est. subtotal</span>
                          <span className="font-display text-xl">{formatPrice(subtotal.toFixed(2), currency)}</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-3">
                          Indicative retail — Eshlan will confirm final pricing, freight and any project discounts.
                        </p>
                      </>
                    )}
                  </div>
                </aside>
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

function Field({ label, value, onChange, error, type = "text", placeholder }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</Label>
      <Input type={type} value={value} onChange={onChange} placeholder={placeholder} className="mt-2 rounded-none border-border focus-visible:border-foreground focus-visible:ring-0" />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function AreaField({ label, value, onChange, error, rows = 3, placeholder }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</Label>
      <Textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder} className="mt-2 rounded-none border-border focus-visible:border-foreground focus-visible:ring-0" />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

export default QuoteRequest;