
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, MapPin, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Company } from "@/hooks/useCompany";

interface CompanyBannerProps {
  company: Company;
  className?: string;
}

export default function CompanyBanner({ company, className }: CompanyBannerProps) {
  return (
    <Card className={cn("rounded-2xl shadow-sm border border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/90 text-primary-foreground flex items-center justify-center shadow">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">{company.name}</CardTitle>
            <div className="text-xs text-muted-foreground">Company Tenant</div>
          </div>
        </div>
        <Badge variant="secondary" className="rounded-full">Tenant</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="text-sm">{company.address || "—"}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">Billing Email</div>
              <div className="text-sm">{company.billing_email || "—"}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">Phone</div>
              <div className="text-sm">{company.phone || "—"}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Receipt className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">VAT Number</div>
              <div className="text-sm">{company.vat_number || "—"}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
