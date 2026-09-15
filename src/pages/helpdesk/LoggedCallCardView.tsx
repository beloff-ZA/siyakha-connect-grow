import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Printer, Paperclip } from "lucide-react";
import {
  attachmentLink,
  formatDuration,
  formatFileSize,
  getCall,
  listAttachments,
  listItems,
  statusLabel,
  timeOnSiteMinutes,
  totalKm,
  type LoggedCall,
  type LoggedCallAttachment,
  type LoggedCallItem,
} from "@/lib/loggedCalls";

const dt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("en-ZA") : "—");

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-sm break-words">{value || "—"}</p>
  </div>
);

const Block: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-sm whitespace-pre-wrap">{value || "—"}</p>
  </div>
);

/** Read-only record of a job card. Nothing here can be edited. */
const LoggedCallCardView: React.FC = () => {
  const { callId = "" } = useParams();
  const { toast } = useToast();
  const [call, setCall] = useState<LoggedCall | null>(null);
  const [items, setItems] = useState<LoggedCallItem[]>([]);
  const [files, setFiles] = useState<LoggedCallAttachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const c = await getCall(callId);
        setCall(c);
        if (c) {
          setItems(await listItems(c.id));
          setFiles(await listAttachments(c.id));
        }
      } catch (e: unknown) {
        toast({ title: "Could not load this job card", description: (e as Error).message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId]);

  const open = async (att: LoggedCallAttachment) => {
    try {
      window.open(await attachmentLink(att.storage_path), "_blank");
    } catch (e: unknown) {
      toast({ title: "Could not open file", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!call) return <p className="text-muted-foreground">This job card could not be found.</p>;

  const contact = [call.end_customer_first_name, call.end_customer_last_name].filter(Boolean).join(" ");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Link to={`/helpdesk/logged-calls/${call.id}`}>
          <Button variant="ghost" size="sm" className="min-h-11">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to job card
          </Button>
        </Link>
        <Badge variant="outline">{statusLabel(call.status)}</Badge>
        {call.signoff_status === "signed" && <Badge className="bg-foreground text-background">Signed off</Badge>}
        <Button variant="outline" onClick={() => window.print()} className="ml-auto min-h-11">
          <Printer className="h-4 w-4 mr-1" />
          Print / save PDF
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {call.call_ref}
            {call.sit_number ? ` · SIT ${call.sit_number}` : ""} — {call.end_customer_company}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Row label="Client who logged the call" value={call.logging_customer} />
          <Row label="Their reference" value={call.customer_order_ref} />
          <Row label="Engineer" value={call.engineer_name} />
          <Row label="End customer" value={call.end_customer_company} />
          <Row label="Site contact" value={contact} />
          <Row label="Contact number" value={call.contact_number} />
          <Row label="Contact email" value={call.contact_email} />
          <Row label="Site address" value={[call.site_address, call.city].filter(Boolean).join(", ")} />
          <Row label="Priority" value={statusLabel(call.priority)} />
          <Row label="Logged" value={dt(call.logged_at)} />
          <Row label="Appointment" value={dt(call.scheduled_at)} />
          <Row label="Arrival" value={dt(call.arrival_at)} />
          <Row label="Departure" value={dt(call.departure_at)} />
          <Row label="Time on site" value={formatDuration(timeOnSiteMinutes(call.arrival_at, call.departure_at))} />
          <Row
            label="Travel"
            value={
              totalKm(call.opening_km, call.closing_km) === null
                ? "—"
                : `${totalKm(call.opening_km, call.closing_km)} km (${call.opening_km} → ${call.closing_km})`
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Fault and work done</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Block label="Fault / request as logged" value={call.fault_description} />
          <Block label="Special instructions" value={call.special_instructions} />
          <Block label="Work done / solution" value={call.fault_solution} />
          <Block label="Change control" value={call.change_control} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Additional items used</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 && <p className="text-sm text-muted-foreground">None captured.</p>}
          {items.map((it) => (
            <div key={it.id} className="flex flex-wrap gap-x-4 border-b border-border pb-2 text-sm last:border-0">
              <span className="flex-1 min-w-[180px]">{it.description}</span>
              {it.serial_number && <span className="text-muted-foreground">S/N {it.serial_number}</span>}
              <span className="text-muted-foreground">Qty {it.quantity}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Attached forms and photos</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {files.length === 0 && <p className="text-sm text-muted-foreground">No files uploaded.</p>}
          {files.map((f) => (
            <div key={f.id} className="flex flex-wrap items-center gap-3 border-b border-border pb-2 text-sm last:border-0">
              <Paperclip className="h-4 w-4 shrink-0" />
              <span className="flex-1 min-w-[180px] break-all">{f.label ? `${f.label} — ` : ""}{f.file_name}</span>
              <span className="text-muted-foreground">{formatFileSize(f.size_bytes)}</span>
              <Button variant="outline" size="sm" className="min-h-11 print:hidden" onClick={() => open(f)}>
                Open
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Customer sign-off</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {call.signoff_status === "signed" ? (
            <>
              <Row label="Signed by" value={call.signed_by_name} />
              <Row label="Email" value={call.signed_by_email} />
              <Row label="Signed at" value={dt(call.signed_at)} />
              <Row label="Satisfaction" value={call.satisfaction_rating ? `${call.satisfaction_rating}/5` : "—"} />
              <Row label="Customer comment" value={call.signoff_comment} />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Signature</p>
                {call.signature_data ? (
                  <img src={call.signature_data} alt="Customer signature" className="mt-1 max-h-20" />
                ) : (
                  <p className="text-sm">—</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground sm:col-span-3">Not signed off yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoggedCallCardView;
