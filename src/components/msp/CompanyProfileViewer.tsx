import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";

export default function CompanyProfileViewer() {
  const { company } = useCompany();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const onPickFile = () => fileInputRef.current?.click();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    try {
      setUploading(true);
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${company.id}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("company-logos")
        .upload(path, file, { contentType: file.type || "image/png", upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("company-logos").getPublicUrl(path);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error("Could not get public URL for logo");

      const { error: updErr } = await supabase
        .from("companies")
        .update({ logo_url: publicUrl })
        .eq("id", company.id);
      if (updErr) throw updErr;

      toast({ title: "Logo updated", description: "Your company logo has been saved." });
      // Soft refresh to update any dependent UI
      setTimeout(() => window.location.reload(), 300);
    } catch (err: any) {
      console.error("Logo upload failed", err);
      toast({ title: "Upload failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!company) return null;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Company Profile</CardTitle>
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
          />
          <Button variant="outline" className="rounded-xl" onClick={onPickFile} disabled={uploading}>
            {uploading ? "Uploading…" : company.logo_url ? "Change Logo" : "Upload Logo"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl border border-border bg-card flex items-center justify-center overflow-hidden">
            {company.logo_url ? (
              <img src={company.logo_url} alt={`${company.name} logo`} className="h-full w-full object-contain" loading="lazy" />
            ) : (
              <span className="text-sm text-muted-foreground">No logo</span>
            )}
          </div>
          <div>
            <div className="font-semibold">{company.name}</div>
            {company.vat_number && (
              <div className="text-sm text-muted-foreground">VAT: {company.vat_number}</div>
            )}
            {company.company_type && (
              <div className="text-sm text-muted-foreground capitalize">Type: {String(company.company_type).replace('_',' ')}</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {company.billing_email && (
            <div>
              <div className="text-xs text-muted-foreground">Billing Email</div>
              <div className="text-sm">{company.billing_email}</div>
            </div>
          )}
          {company.phone && (
            <div>
              <div className="text-xs text-muted-foreground">Phone</div>
              <div className="text-sm">{company.phone}</div>
            </div>
          )}
          {company.address && (
            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="text-sm">{company.address}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
