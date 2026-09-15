import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Printer } from "lucide-react";
import { getCall, listItems, statusLabel, type LoggedCall, type LoggedCallItem } from "@/lib/loggedCalls";
import { JOB_CARD_SHEET_CSS, jobCardSheetHtml } from "@/lib/jobCardSheet";

/** Printable replica of the Satio service request / sign-off form. */
const JobCardSheet: React.FC = () => {
  const { callId = "" } = useParams();
  const { toast } = useToast();
  const [call, setCall] = useState<LoggedCall | null>(null);
  const [items, setItems] = useState<LoggedCallItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const c = await getCall(callId);
        setCall(c);
        if (c) setItems(await listItems(c.id));
      } catch (e: unknown) {
        toast({ title: "Could not load this sheet", description: (e as Error).message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!call) return <p className="text-muted-foreground">This job card could not be found.</p>;

  return (
    <div className="space-y-4">
      <style>{JOB_CARD_SHEET_CSS}</style>
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

      <div className="overflow-x-auto rounded-md border border-border bg-white p-3 print:border-0 print:p-0">
        <div dangerouslySetInnerHTML={{ __html: jobCardSheetHtml(call as unknown as Record<string, unknown>, items) }} />
      </div>
    </div>
  );
};

export default JobCardSheet;
