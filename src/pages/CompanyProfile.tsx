import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import AuthGate from "@/components/msp/AuthGate";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().min(2, "Company name is required"),
  billing_email: z.string().email("Enter a valid email").optional().or(z.literal("")).transform(v => v || null),
  phone: z.string().optional().or(z.literal("")).transform(v => v || null),
  address: z.string().optional().or(z.literal("")).transform(v => v || null),
  vat_number: z.string().optional().or(z.literal("")).transform(v => v || null),
});

export default function CompanyProfile() {
  const { toast } = useToast();

  useEffect(() => {
    const title = "Company Profile | Siyakha Technology";
    const description = "Create or update your company profile details securely.";
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/company`);
  }, []);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", billing_email: "", phone: "", address: "", vat_number: "" },
  });

  const isUpdate = useMemo(() => !!(form.getValues() as any).id, [form]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, billing_email, phone, address, vat_number')
        .limit(1)
        .maybeSingle();
      if (error) return; // silently ignore
      if (mounted && data) {
        form.reset({
          // @ts-ignore id is tracked internally for updates only
          id: (data as any).id,
          name: data.name || "",
          billing_email: data.billing_email || "",
          phone: data.phone || "",
          address: data.address || "",
          vat_number: data.vat_number || "",
        } as any);
      }
    })();
    return () => { mounted = false; };
  }, [form]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    // @ts-ignore track id if present
    const id = (form.getValues() as any).id as string | undefined;
    if (id) {
      const { error } = await supabase
        .from('companies')
        .update({
          name: values.name,
          billing_email: values.billing_email,
          phone: values.phone,
          address: values.address,
          vat_number: values.vat_number,
        })
        .eq('id', id);
      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Company updated', description: 'Your company profile was saved.' });
      }
    } else {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: values.name,
          billing_email: values.billing_email,
          phone: values.phone,
          address: values.address,
          vat_number: values.vat_number,
          metadata: {},
        })
        .select('id')
        .maybeSingle();
      if (error) {
        toast({ title: 'Creation failed', description: error.message, variant: 'destructive' });
      } else {
        // After trigger, user is a member; keep id for subsequent edits
        form.reset({ ...(values as any), id: data?.id } as any);
        toast({ title: 'Company created', description: 'You can now manage tickets under this company.' });
      }
    }
  };

  return (
    <AuthGate>
      <main className="min-h-screen bg-background">
        <section className="container mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-2xl font-semibold tracking-tight mb-6">Company Profile</h1>
          <article>
            <Card className="shadow-sm border border-border">
              <CardHeader>
                <CardTitle className="text-lg">{isUpdate ? 'Update your company' : 'Create your company'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Company name</Label>
                    <Input id="name" placeholder="Acme Ltd" {...form.register('name')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="billing_email">Billing email</Label>
                    <Input id="billing_email" type="email" placeholder="billing@company.com" {...form.register('billing_email')} />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+27 10 123 4567" {...form.register('phone')} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="vat_number">VAT number</Label>
                      <Input id="vat_number" placeholder="ZA123456789" {...form.register('vat_number')} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Company address" {...form.register('address')} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="submit" className="cta-primary">{isUpdate ? 'Save changes' : 'Create company'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </article>
        </section>
      </main>
    </AuthGate>
  );
}
