import { useEffect, useMemo, useState } from "react";
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
 
   useEffect(() => {
     const msg = sessionStorage.getItem('company_registered_msg');
     if (msg) {
       toast({ title: 'Thank you for registering', description: msg });
       sessionStorage.removeItem('company_registered_msg');
     }
   }, [toast]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", billing_email: "", phone: "", address: "", vat_number: "" },
  });

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

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
        sessionStorage.setItem('company_registered_msg', "Your profile needs to be confirmed via email. If you didn't receive the email, check your junk box.");
        window.location.reload();
      }
    }
  };
  const inviteMember = async () => {
    const id = (form.getValues() as any).id as string | undefined;
    if (!id) {
      toast({ title: 'Create a company first', description: 'Save your company details before inviting staff.', variant: 'destructive' });
      return;
    }
    if (!inviteEmail) {
      toast({ title: 'Enter an email', description: 'Provide the staff member’s email address.' });
      return;
    }
    try {
      setInviting(true);
      const { error } = await supabase.rpc('add_company_member_by_email', { _company_id: id, _email: inviteEmail });
      if (error) {
        toast({ title: 'Invite failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Invitation sent', description: 'If the user exists, they have been added as a member.' });
        setInviteEmail('');
      }
    } finally {
      setInviting(false);
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
                  {isUpdate && (
                    <div className="mt-8 border-t border-border pt-6">
                      <h2 className="text-base font-medium mb-3">Invite staff member</h2>
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <Input
                          id="invite_email"
                          type="email"
                          placeholder="staff@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Button type="button" onClick={inviteMember} disabled={inviting}>
                          {inviting ? 'Adding...' : 'Add to company'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Only admins can add members. The user must have an existing account.</p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </article>
        </section>
      </main>
    </AuthGate>
  );
}
