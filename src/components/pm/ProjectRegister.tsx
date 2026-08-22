import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip, Panel, selectCls } from "./ui";
import useClientSiteDialogs from "./ClientSiteDialogs";
import NewProjectWizard from "./NewProjectWizard";
import { projectWorkspacePath } from "@/lib/projectWizard";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";
import { ArrowRight, Plus, Search } from "lucide-react";

/**
 * Clean project register. One prominent action per project ("Manage project")
 * plus a single "Create new project" entry point. Client and site editing stays
 * available but secondary, and commercial totals are intentionally not shown.
 */
const ProjectRegister: React.FC<{ ws: PmWorkspace }> = ({ ws }) => {
  const { clients, sites, projects, reload } = ws;
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [wizard, setWizard] = useState(false);

  const dialogs = useClientSiteDialogs({ clients, reload });

  const statuses = useMemo(
    () => Array.from(new Set(projects.map((p) => p.status).filter(Boolean))) as string[],
    [projects],
  );

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects
      .map((p) => ({
        project: p,
        client: clients.find((c) => c.id === p.client_id) ?? null,
        site: sites.find((s) => s.id === p.site_id) ?? null,
      }))
      .filter((r) => (clientFilter ? r.project.client_id === clientFilter : true))
      .filter((r) => (statusFilter ? r.project.status === statusFilter : true))
      .filter((r) =>
        needle
          ? [r.project.title, r.project.reference, r.project.address, r.client?.display_name, r.site?.name]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(needle)
          : true,
      );
  }, [projects, clients, sites, q, clientFilter, statusFilter]);

  return (
    <div>
      <Panel
        title="Project register"
        actions={
          <Button onClick={() => setWizard(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create new project
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search client, site, project or reference"
              className="pl-9"
            />
          </div>
          <select className={selectCls} value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            <option value="">All clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name}
              </option>
            ))}
          </select>
          <select className={selectCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid gap-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects match this view.</p>
          ) : (
            rows.map(({ project, client, site }) => (
              <article
                key={project.id}
                className="flex flex-wrap items-center justify-between gap-4 border border-border p-4"
              >
                <div className="min-w-[220px]">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {client?.display_name ?? "Unassigned client"}
                    {site ? ` · ${site.name}` : ""}
                  </p>
                  <h4 className="mt-1 text-base font-semibold tracking-tight">{project.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[project.reference, project.address].filter(Boolean).join(" · ") || "No reference captured"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {project.status && <Chip>{project.status}</Chip>}
                  <Button onClick={() => navigate(projectWorkspacePath(project.id))} className="gap-2">
                    Manage project <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </Panel>

      <Panel
        title="Clients & sites"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={dialogs.newClient}>
              New client
            </Button>
            <Button size="sm" variant="outline" onClick={() => dialogs.newSite()}>
              New site
            </Button>
          </div>
        }
      >
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clients captured yet.</p>
        ) : (
          <div className="grid gap-2">
            {clients.map((c) => {
              const clientSites = sites.filter((s) => s.client_id === c.id);
              return (
                <div key={c.id} className="border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{c.display_name}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => dialogs.editClient(c)}
                        className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline"
                      >
                        Edit client
                      </button>
                      <button
                        type="button"
                        onClick={() => dialogs.newSite(c.id)}
                        className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline"
                      >
                        Add site
                      </button>
                    </div>
                  </div>
                  {clientSites.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {clientSites.map((s) => (
                        <li key={s.id}>
                          {s.name}
                          <button
                            type="button"
                            onClick={() => dialogs.editSite(s)}
                            className="ml-2 underline"
                          >
                            edit
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {dialogs.dialogs}
      {wizard && (
        <NewProjectWizard
          ws={ws}
          open={wizard}
          onClose={() => setWizard(false)}
          onCreated={(id) => navigate(projectWorkspacePath(id, "plans"))}
        />
      )}
    </div>
  );
};

export default ProjectRegister;
