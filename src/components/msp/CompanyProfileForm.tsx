import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().min(2, "Company name is required"),
  billing_email: z.string().email("Enter a valid email").optional().or(z.literal("")).transform(v => v || null),
  phone: z.string().optional().or(z.literal("")).transform(v => v || null),
  address: z.string().optional().or(z.literal("")).transform(v => v || null),
  vat_number: z.string().optional().or(z.literal("")).transform(v => v || null),
});

export interface CompanyLike {
  id?: string;
  name: string;
  billing_email?: string | null;
  phone?: string | null;
  address?: string | null;
  vat_number?: string | null;
}

export default function CompanyProfileForm({ initialCompany, onSubmitted }: { initialCompany?: CompanyLike | null; onSubmitted?: () => void }) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialCompany?.name || "",
      billing_email: initialCompany?.billing_email || "",
      phone: initialCompany?.phone || "",
      address: initialCompany?.address || "",
      vat_number: initialCompany?.vat_number || "",
    },
  });

  useEffect(() => {
    // If no initial company provided, try load the user's first company
    if (!initialCompany) {
      (async () => {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, billing_email, phone, address, vat_number')
          .limit(1)
          .maybeSingle();
        if (!error && data) {
          form.reset({
            // @ts-ignore track id internally
            id: (data as any).id,
            name: data.name || "",
            billing_email: data.billing_email || "",
            phone: data.phone || "",
            address: data.address || "",
            vat_number: data.vat_number || "",
          } as any);
        }
      })();
    } else {
      // Ensure form reflects provided initial values
      form.reset({
        // @ts-ignore
        id: (initialCompany as any).id,
        name: initialCompany.name || "",
        billing_email: initialCompany.billing_email || "",
        phone: initialCompany.phone || "",
        address: initialCompany.address || "",
        vat_number: initialCompany.vat_number || "",
      } as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCompany?.id]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    // @ts-ignore
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
        onSubmitted?.();
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
        // Persist cross-page message and refresh to pick up new membership & company
        sessionStorage.setItem('company_registered_msg', "Your profile needs to be confirmed via email. If you didn't receive the email, check your junk box.");
        window.setTimeout(() => window.location.reload(), 400);
      }
    }
  };

  return (
    <Card className="shadow-sm border border-border">
      <CardContent className="pt-6">
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
            <Button type="submit" className="cta-primary">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
