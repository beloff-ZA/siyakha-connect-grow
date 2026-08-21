import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DOCUMENTS_BUCKET, PHOTOS_BUCKET, formatDate } from "@/lib/portalFiles";
import { statusLabel } from "@/hooks/usePortal";
import BoqManager from "@/components/helpdesk/BoqManager";
import FloorPlansManager from "@/components/helpdesk/FloorPlansManager";
import SiteImagesManager from "@/components/helpdesk/SiteImagesManager";
import SitesManager from "@/components/helpdesk/SitesManager";
import NotificationSettings from "@/components/helpdesk/NotificationSettings";
import TestAccountDialog, { type TestAccountTarget } from "@/components/helpdesk/TestAccountDialog";



type Row = Record<string, any>;

/** Production client-login callback used for first-time account setup links. */
const PRODUCTION_LOGIN_URL = "https://siyakhatechnology.co.za/client-login";

const PROJECT_STATUSES = ["planning", "in_progress", "on_hold", "complete"];
const ITEM_STATUSES = ["not_started", "in_progress", "blocked", "complete"];
const PRIORITIES = ["low", "medium", "high"];


const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="border border-border p-5 md:p-6 mb-6">
    <h3 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-4">{title}</h3>
    {children}
  </section>
);

const selectCls = "h-10 border border-input bg-background px-3 text-sm w-full";

const ClientPortalAdmin: React.FC = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Row[]>([]);
  const [clientUsers, setClientUsers] = useState<Row[]>([]);
  const [projects, setProjects] = useState<Row[]>([]);
  const [phases, setPhases] = useState<Row[]>([]);
  const [milestones, setMilestones] = useState<Row[]>([]);
  const [tasks, setTasks] = useState<Row[]>([]);
  const [updates, setUpdates] = useState<Row[]>([]);
  const [documents, setDocuments] = useState<Row[]>([]);
  const [photos, setPhotos] = useState<Row[]>([]);
  const [queries, setQueries] = useState<Row[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const fail = (e: unknown) =>
    toast({
      title: "Action failed",
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive" as never,
    });

  const loadBase = useCallback(async () => {
    const [c, cu, p, q] = await Promise.all([
      supabase.from("portal_clients").select("*").order("display_name"),
      supabase.from("portal_client_users").select("*").order("created_at"),
      supabase.from("portal_projects").select("*").order("created_at"),
      supabase.from("portal_queries").select("*").order("created_at", { ascending: false }),
    ]);
    setClients(c.data ?? []);
    setClientUsers(cu.data ?? []);
    setProjects(p.data ?? []);
    setQueries(q.data ?? []);
    setProjectId((prev) => prev || (p.data?.[0]?.id ?? ""));
  }, []);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    const [ph, ms, tk, up, dc, pho] = await Promise.all([
      supabase.from("portal_phases").select("*").eq("project_id", projectId).order("sort_order"),
      supabase.from("portal_milestones").select("*").eq("project_id", projectId).order("sort_order"),
      supabase.from("portal_tasks").select("*").eq("project_id", projectId).order("sort_order"),
      supabase.from("portal_updates").select("*").eq("project_id", projectId).order("posted_at", { ascending: false }),
      supabase.from("portal_documents").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase.from("portal_photos").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
    ]);
    setPhases(ph.data ?? []);
    setMilestones(ms.data ?? []);
    setTasks(tk.data ?? []);
    setUpdates(up.data ?? []);
    setDocuments(dc.data ?? []);
    setPhotos(pho.data ?? []);
  }, [projectId]);

  useEffect(() => {
    document.title = "Client Portal Admin | Siyakha";
    loadBase();
  }, [loadBase]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const project = projects.find((p) => p.id === projectId);

  /* ---------- Clients & invites ---------- */
  const [newClient, setNewClient] = useState({ display_name: "", contact_name: "", contact_email: "", phone: "" });
  const createClient = async () => {
    if (!newClient.display_name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("portal_clients").insert({
      display_name: newClient.display_name.trim(),
      contact_name: newClient.contact_name.trim() || null,
      contact_email: newClient.contact_email.trim() || null,
      phone: newClient.phone.trim() || null,
    });
    setBusy(false);
    if (error) return fail(error);
    setNewClient({ display_name: "", contact_name: "", contact_email: "", phone: "" });
    toast({ title: "Client created" });
    loadBase();
  };

  const [newUser, setNewUser] = useState({ client_id: "", email: "", full_name: "" });
  const createClientUser = async () => {
    if (!newUser.client_id || !newUser.email.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("portal_client_users").insert({
      client_id: newUser.client_id,
      email: newUser.email.trim().toLowerCase(),
      full_name: newUser.full_name.trim() || null,
    });
    setBusy(false);
    if (error) return fail(error);
    setNewUser({ client_id: "", email: "", full_name: "" });
    toast({ title: "Client user added", description: "Send the invitation to activate the account." });
    loadBase();
  };

  /** TESTING-ONLY: no-email account activation / password reset. */
  const [testTarget, setTestTarget] = useState<TestAccountTarget | null>(null);

  const sendInvite = async (clientUserId: string, redirectTo?: string) => {


    setBusy(true);
    const { data, error } = await supabase.functions.invoke("invite-client-user", {
      body: {
        client_user_id: clientUserId,
        redirect_to: redirectTo ?? `${window.location.origin}/client-login`,
      },
    });
    setBusy(false);
    if (error) return fail(error);
    toast({
      title: "Invitation sent",
      description:
        (data as Row)?.mode === "password_reset"
          ? "A password setup link was emailed to the client."
          : "An invitation email was sent to the client.",
    });
    loadBase();
  };


  const assignUser = async (clientUserId: string) => {
    if (!projectId) return;
    const { error } = await supabase
      .from("portal_project_assignments")
      .insert({ project_id: projectId, client_user_id: clientUserId });
    if (error) return fail(error);
    toast({ title: "Assigned to project" });
  };

  /* ---------- Projects ---------- */
  const [newProject, setNewProject] = useState({ client_id: "", title: "" });
  const createProject = async () => {
    if (!newProject.client_id || !newProject.title.trim()) return;
    setBusy(true);
    const { error } = await supabase
      .from("portal_projects")
      .insert({ client_id: newProject.client_id, title: newProject.title.trim() });
    setBusy(false);
    if (error) return fail(error);
    setNewProject({ client_id: "", title: "" });
    toast({ title: "Project created" });
    loadBase();
  };

  const saveProject = async (patch: Row) => {
    if (!projectId) return;
    const { error } = await supabase.from("portal_projects").update(patch).eq("id", projectId);
    if (error) return fail(error);
    toast({ title: "Project saved" });
    loadBase();
  };

  /* ---------- Tracker ---------- */
  const addPhase = async (name: string) => {
    if (!name.trim() || !projectId) return;
    const { error } = await supabase
      .from("portal_phases")
      .insert({ project_id: projectId, name: name.trim(), sort_order: phases.length + 1 });
    if (error) return fail(error);
    loadProject();
  };

  const updateRow = async (table: string, id: string, patch: Row) => {
    const { error } = await supabase.from(table as never).update(patch as never).eq("id", id);
    if (error) return fail(error);
    loadProject();
  };

  const deleteRow = async (table: string, id: string) => {
    const { error } = await supabase.from(table as never).delete().eq("id", id);
    if (error) return fail(error);
    loadProject();
  };

  const [newMilestone, setNewMilestone] = useState({ title: "", phase_id: "", due_date: "" });
  const addMilestone = async () => {
    if (!newMilestone.title.trim() || !projectId) return;
    const { error } = await supabase.from("portal_milestones").insert({
      project_id: projectId,
      title: newMilestone.title.trim(),
      phase_id: newMilestone.phase_id || null,
      due_date: newMilestone.due_date || null,
      sort_order: milestones.length + 1,
    });
    if (error) return fail(error);
    setNewMilestone({ title: "", phase_id: "", due_date: "" });
    loadProject();
  };

  const [newTask, setNewTask] = useState({ title: "", phase_id: "", owner: "", priority: "medium", due_date: "" });
  const addTask = async () => {
    if (!newTask.title.trim() || !projectId) return;
    const { error } = await supabase.from("portal_tasks").insert({
      project_id: projectId,
      title: newTask.title.trim(),
      phase_id: newTask.phase_id || null,
      owner: newTask.owner.trim() || null,
      priority: newTask.priority,
      due_date: newTask.due_date || null,
      sort_order: tasks.length + 1,
    });
    if (error) return fail(error);
    setNewTask({ title: "", phase_id: "", owner: "", priority: "medium", due_date: "" });
    loadProject();
  };

  /* ---------- Updates ---------- */
  const [newUpdate, setNewUpdate] = useState({ title: "", body: "", status: "" });
  const postUpdate = async () => {
    if (!newUpdate.title.trim() || !projectId) return;
    const { error } = await supabase.from("portal_updates").insert({
      project_id: projectId,
      title: newUpdate.title.trim(),
      body: newUpdate.body.trim() || null,
      status: newUpdate.status.trim() || null,
      author_name: "Siyakha Interlink",
    });
    if (error) return fail(error);
    setNewUpdate({ title: "", body: "", status: "" });
    toast({ title: "Update posted" });
    loadProject();
  };

  /* ---------- Files ---------- */
  const [docMeta, setDocMeta] = useState({
    title: "",
    category: "General",
    version: "",
    reference: "",
    phase_id: "",
    document_date: "",
    notes: "",
  });
  const uploadDocument = async (file: File) => {
    if (!projectId) return;
    setBusy(true);
    const safe = (docMeta.title || file.name).toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
    const path = `${projectId}/${Date.now()}-${safe}${file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? ""}`;
    const { error: upErr } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (upErr) {
      setBusy(false);
      return fail(upErr);
    }
    const { error } = await supabase.from("portal_documents").insert({
      project_id: projectId,
      title: docMeta.title.trim() || file.name,
      category: docMeta.category.trim() || "General",
      version: docMeta.version.trim() || null,
      reference: docMeta.reference.trim() || null,
      phase_id: docMeta.phase_id || null,
      document_date: docMeta.document_date || null,
      notes: docMeta.notes.trim() || null,
      storage_path: path,
      file_size: file.size,
      mime_type: file.type || null,
    });
    setBusy(false);
    if (error) return fail(error);
    setDocMeta({ title: "", category: "General", version: "", reference: "", phase_id: "", document_date: "", notes: "" });
    toast({ title: "Document uploaded" });
    loadProject();
  };

  /** Attaches a file to an existing document record that is still awaiting its upload. */
  const attachDocumentFile = async (docId: string, title: string, file: File) => {
    if (!projectId) return;
    setBusy(true);
    const safe = (title || file.name).toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
    const path = `${projectId}/${Date.now()}-${safe}${file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? ""}`;
    const { error: upErr } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (upErr) {
      setBusy(false);
      return fail(upErr);
    }
    const { error } = await supabase
      .from("portal_documents")
      .update({ storage_path: path, file_size: file.size, mime_type: file.type || null })
      .eq("id", docId);
    setBusy(false);
    if (error) return fail(error);
    toast({ title: "File attached to document record" });
    loadProject();
  };


  const [photoMeta, setPhotoMeta] = useState({ caption: "", taken_at: "", phase_id: "" });
  const uploadPhoto = async (file: File) => {
    if (!projectId) return;
    setBusy(true);
    const path = `${projectId}/${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-")}`;
    const { error: upErr } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file, {
      contentType: file.type || undefined,
    });
    if (upErr) {
      setBusy(false);
      return fail(upErr);
    }
    const { error } = await supabase.from("portal_photos").insert({
      project_id: projectId,
      caption: photoMeta.caption.trim() || null,
      taken_at: photoMeta.taken_at || null,
      phase_id: photoMeta.phase_id || null,
      storage_path: path,
      mime_type: file.type || null,
      file_size: file.size,
    });
    setBusy(false);
    if (error) return fail(error);
    setPhotoMeta({ caption: "", taken_at: "", phase_id: "" });
    toast({ title: "Photo uploaded" });
    loadProject();
  };

  const respond = async (id: string, response: string) => {
    const { error } = await supabase
      .from("portal_queries")
      .update({ admin_response: response, status: "answered", responded_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return fail(error);
    toast({ title: "Response saved" });
    loadBase();
  };

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-2">Client portal</p>
        <h1 className="font-display text-3xl font-light tracking-tight">Client portal management</h1>
      </header>

      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-end gap-3">
        <div className="w-full sm:w-96">
          <Label htmlFor="admin-project">Active project</Label>
          <select
            id="admin-project"
            className={selectCls}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        {busy && <span className="text-xs text-muted-foreground">Working…</span>}
      </div>

      <Tabs defaultValue="clients">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="clients">Clients & invites</TabsTrigger>
          <TabsTrigger value="sites">Sites & registrations</TabsTrigger>
          <TabsTrigger value="project">Project</TabsTrigger>
          <TabsTrigger value="tracker">Tracker</TabsTrigger>
          <TabsTrigger value="files">Documents & photos</TabsTrigger>
          <TabsTrigger value="boq">BOQ</TabsTrigger>
          <TabsTrigger value="plans">Floor plans</TabsTrigger>
          <TabsTrigger value="site-images">Site images</TabsTrigger>


          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="queries">Queries</TabsTrigger>
          <TabsTrigger value="notifications">Email notifications</TabsTrigger>

        </TabsList>

        <TabsContent value="clients" className="pt-6">
          <Section title="Create client">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="c-name">Display name</Label>
                <Input id="c-name" value={newClient.display_name} onChange={(e) => setNewClient({ ...newClient, display_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-contact">Contact name</Label>
                <Input id="c-contact" value={newClient.contact_name} onChange={(e) => setNewClient({ ...newClient, contact_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">Contact email</Label>
                <Input id="c-email" type="email" value={newClient.contact_email} onChange={(e) => setNewClient({ ...newClient, contact_email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-phone">Phone</Label>
                <Input id="c-phone" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
              </div>
            </div>
            <Button className="mt-4" onClick={createClient} disabled={busy}>Create client</Button>
          </Section>

          <Section title="Add client user (invite-only)">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="u-client">Client</Label>
                <select id="u-client" className={selectCls} value={newUser.client_id} onChange={(e) => setNewUser({ ...newUser, client_id: e.target.value })}>
                  <option value="">Select…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.display_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-email">Email</Label>
                <Input id="u-email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-name">Full name</Label>
                <Input id="u-name" value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} />
              </div>
            </div>
            <Button className="mt-4" onClick={createClientUser} disabled={busy}>Add client user</Button>
          </Section>

          <Section title="Client users">
            {clientUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No client users yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {clientUsers.map((cu) => (
                  <li key={cu.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div>
                      <p className="text-sm">{cu.full_name ?? cu.email}</p>
                      <p className="text-xs text-muted-foreground break-all">
                        {cu.email} · {statusLabel(cu.status)} ·{" "}
                        {clients.find((c) => c.id === cu.client_id)?.display_name ?? "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => provisionCredentials(cu.id)}
                        disabled={busy}
                        title="Creates the login with a generated password. No email is sent to the client."
                      >
                        Create login (no email)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => sendInvite(cu.id)} disabled={busy}>
                        Send / resend invite
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendInvite(cu.id, PRODUCTION_LOGIN_URL)}
                        disabled={busy}
                        title={`First-time account setup link pointing at ${PRODUCTION_LOGIN_URL}`}
                      >
                        Send setup link (production)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => assignUser(cu.id)} disabled={!projectId}>
                        Assign to project
                      </Button>
                    </div>

                    {credentials?.client_user_id === cu.id && (
                      <div className="w-full sm:w-auto border border-border p-3 text-xs space-y-1">
                        <p className="uppercase tracking-[0.2em] text-muted-foreground">
                          Credentials — shown once
                        </p>
                        <p className="font-mono break-all">Username: {credentials.email}</p>
                        <p className="font-mono break-all">Password: {credentials.password}</p>
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigator.clipboard
                                .writeText(`Username: ${credentials.email}\nPassword: ${credentials.password}`)
                                .then(() => toast({ title: "Copied" }))
                            }
                          >
                            Copy
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setCredentials(null)}>
                            Hide
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>

                ))}
              </ul>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="sites" className="pt-6">
          <SitesManager />
        </TabsContent>

        <TabsContent value="project" className="pt-6">
          <Section title="Create project">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="np-client">Client</Label>
                <select id="np-client" className={selectCls} value={newProject.client_id} onChange={(e) => setNewProject({ ...newProject, client_id: e.target.value })}>
                  <option value="">Select…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.display_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-title">Title</Label>
                <Input id="np-title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
              </div>
            </div>
            <Button className="mt-4" onClick={createProject} disabled={busy}>Create project</Button>
          </Section>

          {project ? (
            <Section title="Edit selected project">
              <ProjectEditor key={project.id} project={project} onSave={saveProject} />
            </Section>
          ) : (
            <p className="text-sm text-muted-foreground">Select a project above to edit it.</p>
          )}
        </TabsContent>

        <TabsContent value="tracker" className="pt-6">
          {!projectId ? (
            <p className="text-sm text-muted-foreground">Select a project above.</p>
          ) : (
            <>
              <Section title="Phases">
                <PhaseAdder onAdd={addPhase} />
                <ul className="divide-y divide-border mt-4">
                  {phases.map((ph) => (
                    <li key={ph.id} className="py-3 flex items-center gap-3 justify-between">
                      <span className="text-sm">{ph.name}</span>
                      <div className="flex items-center gap-2">
                        <select
                          className="h-9 border border-input bg-background px-2 text-xs"
                          value={ph.status}
                          onChange={(e) => updateRow("portal_phases", ph.id, { status: e.target.value })}
                          aria-label={`Status for ${ph.name}`}
                        >
                          {ITEM_STATUSES.map((s) => (
                            <option key={s} value={s}>{statusLabel(s)}</option>
                          ))}
                        </select>
                        <Button size="sm" variant="ghost" onClick={() => deleteRow("portal_phases", ph.id)}>Delete</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Milestones">
                <div className="grid sm:grid-cols-3 gap-3">
                  <Input placeholder="Milestone title" value={newMilestone.title} onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })} />
                  <select className={selectCls} value={newMilestone.phase_id} onChange={(e) => setNewMilestone({ ...newMilestone, phase_id: e.target.value })} aria-label="Milestone phase">
                    <option value="">No phase</option>
                    {phases.map((ph) => (<option key={ph.id} value={ph.id}>{ph.name}</option>))}
                  </select>
                  <Input type="date" value={newMilestone.due_date} onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })} aria-label="Milestone due date" />
                </div>
                <Button className="mt-3" size="sm" onClick={addMilestone}>Add milestone</Button>
                <ul className="divide-y divide-border mt-4">
                  {milestones.map((m) => (
                    <li key={m.id} className="py-3 flex items-center gap-3 justify-between">
                      <span className="text-sm">{m.title} <span className="text-xs text-muted-foreground">· {formatDate(m.due_date)}</span></span>
                      <div className="flex items-center gap-2">
                        <select className="h-9 border border-input bg-background px-2 text-xs" value={m.status} onChange={(e) => updateRow("portal_milestones", m.id, { status: e.target.value })} aria-label={`Status for ${m.title}`}>
                          {ITEM_STATUSES.map((s) => (<option key={s} value={s}>{statusLabel(s)}</option>))}
                        </select>
                        <Button size="sm" variant="ghost" onClick={() => deleteRow("portal_milestones", m.id)}>Delete</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Tasks">
                <div className="grid sm:grid-cols-5 gap-3">
                  <Input placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                  <select className={selectCls} value={newTask.phase_id} onChange={(e) => setNewTask({ ...newTask, phase_id: e.target.value })} aria-label="Task phase">
                    <option value="">No phase</option>
                    {phases.map((ph) => (<option key={ph.id} value={ph.id}>{ph.name}</option>))}
                  </select>
                  <Input placeholder="Owner" value={newTask.owner} onChange={(e) => setNewTask({ ...newTask, owner: e.target.value })} />
                  <select className={selectCls} value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} aria-label="Task priority">
                    {PRIORITIES.map((p) => (<option key={p} value={p}>{statusLabel(p)}</option>))}
                  </select>
                  <Input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} aria-label="Task due date" />
                </div>
                <Button className="mt-3" size="sm" onClick={addTask}>Add task</Button>
                <ul className="divide-y divide-border mt-4">
                  {tasks.map((t) => (
                    <li key={t.id} className="py-3 flex items-center gap-3 justify-between">
                      <span className="text-sm">{t.title} <span className="text-xs text-muted-foreground">· {t.owner ?? "—"} · {formatDate(t.due_date)}</span></span>
                      <div className="flex items-center gap-2">
                        <select className="h-9 border border-input bg-background px-2 text-xs" value={t.status} onChange={(e) => updateRow("portal_tasks", t.id, { status: e.target.value })} aria-label={`Status for ${t.title}`}>
                          {ITEM_STATUSES.map((s) => (<option key={s} value={s}>{statusLabel(s)}</option>))}
                        </select>
                        <Button size="sm" variant="ghost" onClick={() => deleteRow("portal_tasks", t.id)}>Delete</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            </>
          )}
        </TabsContent>

        <TabsContent value="files" className="pt-6">
          {!projectId ? (
            <p className="text-sm text-muted-foreground">Select a project above.</p>
          ) : (
            <>
              <Section title="Upload document">
                <div className="grid sm:grid-cols-4 gap-3">
                  <Input placeholder="Title" value={docMeta.title} onChange={(e) => setDocMeta({ ...docMeta, title: e.target.value })} />
                  <Input placeholder="Category" value={docMeta.category} onChange={(e) => setDocMeta({ ...docMeta, category: e.target.value })} />
                  <Input placeholder="Version / revision" value={docMeta.version} onChange={(e) => setDocMeta({ ...docMeta, version: e.target.value })} />
                  <Input placeholder="Job reference" value={docMeta.reference} onChange={(e) => setDocMeta({ ...docMeta, reference: e.target.value })} />
                  <Input type="date" value={docMeta.document_date} onChange={(e) => setDocMeta({ ...docMeta, document_date: e.target.value })} aria-label="Document date" />
                  <select className={selectCls} value={docMeta.phase_id} onChange={(e) => setDocMeta({ ...docMeta, phase_id: e.target.value })} aria-label="Document phase">
                    <option value="">No phase</option>
                    {phases.map((ph) => (<option key={ph.id} value={ph.id}>{ph.name}</option>))}
                  </select>
                  <div className="sm:col-span-2">
                    <Input placeholder="Summary / notes shown to the client" value={docMeta.notes} onChange={(e) => setDocMeta({ ...docMeta, notes: e.target.value })} />
                  </div>
                </div>
                <div className="mt-3">
                  <Label htmlFor="doc-file" className="text-xs">File</Label>
                  <input
                    id="doc-file"
                    type="file"
                    className="block mt-1 text-sm"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadDocument(f);
                      e.target.value = "";
                    }}
                  />
                </div>
                <ul className="divide-y divide-border mt-4">
                  {documents.map((d) => (
                    <li key={d.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-sm">
                        {d.title}{" "}
                        <span className="text-xs text-muted-foreground">
                          · {d.category} · {formatDate(d.document_date)}
                          {d.version ? ` · ${d.version}` : ""}
                          {d.reference ? ` · ${d.reference}` : ""}
                        </span>
                        {!d.storage_path && (
                          <span className="ml-2 text-[10px] uppercase tracking-[0.2em] border border-border px-2 py-0.5">Awaiting upload</span>
                        )}
                      </span>
                      <span className="flex items-center gap-3">
                        {!d.storage_path && (
                          <label className="text-xs cursor-pointer border border-border px-3 py-1.5 hover:bg-muted">
                            Attach file
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) attachDocumentFile(d.id as string, d.title as string, f);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteRow("portal_documents", d.id)}>Delete record</Button>
                      </span>
                    </li>
                  ))}
                </ul>

              </Section>

              <Section title="Upload site photo">
                <div className="grid sm:grid-cols-3 gap-3">
                  <Input placeholder="Caption" value={photoMeta.caption} onChange={(e) => setPhotoMeta({ ...photoMeta, caption: e.target.value })} />
                  <Input type="date" value={photoMeta.taken_at} onChange={(e) => setPhotoMeta({ ...photoMeta, taken_at: e.target.value })} aria-label="Photo date" />
                  <select className={selectCls} value={photoMeta.phase_id} onChange={(e) => setPhotoMeta({ ...photoMeta, phase_id: e.target.value })} aria-label="Photo phase">
                    <option value="">No phase</option>
                    {phases.map((ph) => (<option key={ph.id} value={ph.id}>{ph.name}</option>))}
                  </select>
                </div>
                <div className="mt-3">
                  <Label htmlFor="photo-file" className="text-xs">Image</Label>
                  <input
                    id="photo-file"
                    type="file"
                    accept="image/*"
                    className="block mt-1 text-sm"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadPhoto(f);
                      e.target.value = "";
                    }}
                  />
                </div>
                <ul className="divide-y divide-border mt-4">
                  {photos.map((p) => (
                    <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                      <span className="text-sm">{p.caption ?? p.storage_path}</span>
                      <Button size="sm" variant="ghost" onClick={() => deleteRow("portal_photos", p.id)}>Delete record</Button>
                    </li>
                  ))}
                </ul>
              </Section>
            </>
          )}
        </TabsContent>

        <TabsContent value="boq" className="pt-6">
          <BoqManager projectId={projectId} />
        </TabsContent>

        <TabsContent value="plans" className="pt-6">
          <FloorPlansManager projectId={projectId} />
        </TabsContent>

        <TabsContent value="site-images" className="pt-6">
          <SiteImagesManager projectId={projectId} />
        </TabsContent>



        <TabsContent value="updates" className="pt-6">
          {!projectId ? (
            <p className="text-sm text-muted-foreground">Select a project above.</p>
          ) : (
            <Section title="Post an update">
              <div className="space-y-3">
                <Input placeholder="Title" value={newUpdate.title} onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })} />
                <Input placeholder="Status label (optional)" value={newUpdate.status} onChange={(e) => setNewUpdate({ ...newUpdate, status: e.target.value })} />
                <Textarea rows={4} placeholder="Update details" value={newUpdate.body} onChange={(e) => setNewUpdate({ ...newUpdate, body: e.target.value })} />
                <Button onClick={postUpdate}>Post update</Button>
              </div>
              <ul className="divide-y divide-border mt-6">
                {updates.map((u) => (
                  <li key={u.id} className="py-3 flex items-center justify-between gap-3">
                    <span className="text-sm">{u.title} <span className="text-xs text-muted-foreground">· {formatDate(u.posted_at)}</span></span>
                    <Button size="sm" variant="ghost" onClick={() => deleteRow("portal_updates", u.id)}>Delete</Button>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </TabsContent>

        <TabsContent value="queries" className="pt-6">
          <Section title="Client queries">
            {queries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No client queries yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {queries.map((q) => (
                  <li key={q.id} className="py-4">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(q.created_at)} · {statusLabel(q.status)} ·{" "}
                      {projects.find((p) => p.id === q.project_id)?.title ?? "—"}
                    </p>
                    <p className="text-sm font-medium mt-1">{q.subject}</p>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{q.message}</p>
                    <QueryResponder existing={q.admin_response} onSave={(text) => respond(q.id, text)} />
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="notifications" className="pt-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>

    </div>
  );
};

const PhaseAdder: React.FC<{ onAdd: (name: string) => void }> = ({ onAdd }) => {
  const [name, setName] = useState("");
  return (
    <div className="flex gap-3">
      <Input placeholder="Phase name" value={name} onChange={(e) => setName(e.target.value)} />
      <Button
        size="sm"
        onClick={() => {
          onAdd(name);
          setName("");
        }}
      >
        Add phase
      </Button>
    </div>
  );
};

const QueryResponder: React.FC<{ existing: string | null; onSave: (text: string) => void }> = ({ existing, onSave }) => {
  const [text, setText] = useState(existing ?? "");
  return (
    <div className="mt-3 space-y-2">
      <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Response to client" />
      <Button size="sm" variant="outline" onClick={() => onSave(text)}>Save response</Button>
    </div>
  );
};

const ProjectEditor: React.FC<{ project: Row; onSave: (patch: Row) => void }> = ({ project, onSave }) => {
  const [form, setForm] = useState<Row>({
    title: project.title ?? "",
    status: project.status ?? "planning",
    address: project.address ?? "",
    reference: project.reference ?? "",
    consultant: project.consultant ?? "",
    start_date: project.start_date ?? "",
    target_date: project.target_date ?? "",
    description: project.description ?? "",
    site_context: project.site_context ?? "",
    objectives: project.objectives ?? "",
    stakeholders: project.stakeholders ?? "",
    planning_narrative: project.planning_narrative ?? "",
    risks_notes: project.risks_notes ?? "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ep-title">Title</Label>
          <Input id="ep-title" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ep-status">Status</Label>
          <select id="ep-status" className={selectCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {PROJECT_STATUSES.map((s) => (<option key={s} value={s}>{statusLabel(s)}</option>))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ep-address">Address</Label>
          <Input id="ep-address" value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ep-ref">Reference</Label>
          <Input id="ep-ref" value={form.reference} onChange={(e) => set("reference", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ep-consultant">Consultant</Label>
          <Input id="ep-consultant" value={form.consultant} onChange={(e) => set("consultant", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ep-start">Start date</Label>
          <Input id="ep-start" type="date" value={form.start_date ?? ""} onChange={(e) => set("start_date", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ep-target">Target date</Label>
          <Input id="ep-target" type="date" value={form.target_date ?? ""} onChange={(e) => set("target_date", e.target.value)} />
        </div>
      </div>

      {[
        ["description", "Description & scope"],
        ["site_context", "Site context"],
        ["objectives", "Objectives"],
        ["stakeholders", "Stakeholders"],
        ["planning_narrative", "Planning narrative"],
        ["risks_notes", "Risks & notes"],
      ].map(([key, label]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={`ep-${key}`}>{label}</Label>
          <Textarea id={`ep-${key}`} rows={4} value={form[key] ?? ""} onChange={(e) => set(key, e.target.value)} />
        </div>
      ))}

      <Button
        onClick={() =>
          onSave({
            ...form,
            start_date: form.start_date || null,
            target_date: form.target_date || null,
            address: form.address || null,
            reference: form.reference || null,
            consultant: form.consultant || null,
          })
        }
      >
        Save project
      </Button>
    </div>
  );
};

export default ClientPortalAdmin;
