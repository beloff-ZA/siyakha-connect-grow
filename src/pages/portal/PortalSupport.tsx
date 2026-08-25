import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortal, statusLabel } from "@/hooks/usePortal";
import { PageHeader, Panel, Loading, ErrorNote, NoProject } from "@/components/portal/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/portalFiles";
import { GoogleCalendarBookingButton } from "@/components/GoogleCalendarBookingButton";

type Query = {
  id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
};

const PortalSupport: React.FC = () => {
  const { activeProject, clientUser, loading, error } = usePortal();
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [queries, setQueries] = useState<Query[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Support | Siyakha Client Portal";
  }, []);

  const loadQueries = React.useCallback(async () => {
    if (!activeProject) return;
    const { data } = await supabase
      .from("portal_queries")
      .select("id, subject, message, status, admin_response, created_at")
      .eq("project_id", activeProject.id)
      .order("created_at", { ascending: false });
    setQueries((data ?? []) as unknown as Query[]);
  }, [activeProject]);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!subject.trim() || !message.trim()) {
      setFormError("Add a subject and a message.");
      return;
    }
    if (!activeProject || !clientUser || !user) {
      setFormError("Your account is not linked to this project.");
      return;
    }
    setSubmitting(true);
    const { error: insertError } = await supabase.from("portal_queries").insert({
      project_id: activeProject.id,
      client_user_id: clientUser.id,
      submitted_by: user.id,
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 4000),
    });
    setSubmitting(false);
    if (insertError) {
      setFormError(insertError.message);
      return;
    }
    setSubject("");
    setMessage("");
    toast({ title: "Query sent", description: "The Siyakha team will respond in the portal." });
    loadQueries();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!activeProject) return <NoProject />;

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Support"
        title="Project queries & contact"
        description="Raise a question against this project, or reach the Siyakha team directly."
      />

      <div className="space-y-6">
        <Panel title="New project query">
          <form onSubmit={submit} className="space-y-5" noValidate>
            {formError && <ErrorNote message={formError} />}
            <div className="space-y-2">
              <Label htmlFor="query-subject">Subject</Label>
              <Input
                id="query-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="query-message">Message</Label>
              <Textarea
                id="query-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={4000}
                required
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send query"}
            </Button>
          </form>
        </Panel>

        <Panel title="Your queries">
          {queries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No queries raised yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {queries.map((q) => (
                <li key={q.id} className="py-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {formatDate(q.created_at)} · {statusLabel(q.status)}
                  </p>
                  <p className="text-sm font-medium mt-1">{q.subject}</p>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{q.message}</p>
                  {q.admin_response && (
                    <div className="mt-3 border-l-2 border-foreground pl-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Siyakha response
                      </p>
                      <p className="text-sm mt-1 whitespace-pre-line">{q.admin_response}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Book a technician">
          <p className="text-sm text-muted-foreground mb-4">
            Schedule a technician visit or remote session at a time that suits you.
          </p>
          <Button asChild>
            <a href={TECHNICIAN_BOOKING_URL} target="_top">
              <CalendarCheck className="h-4 w-4 mr-2" strokeWidth={1.5} />
              {TECHNICIAN_BOOKING_LABEL}
            </a>
          </Button>
        </Panel>

        <Panel title="Contact Siyakha">
          <div className="space-y-2 text-sm">
            <a className="block hover:underline" href="mailto:nikita@siyakhatechnology.co.za">
              nikita@siyakhatechnology.co.za
            </a>
            <a className="block text-muted-foreground hover:text-foreground" href="tel:+27877239183">
              +27 87 723 9183
            </a>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default PortalSupport;
