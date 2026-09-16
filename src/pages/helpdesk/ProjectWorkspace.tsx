import React from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePmWorkspace } from "@/hooks/usePmWorkspace";
import ProjectOverviewPanel from "@/components/pm/ProjectOverviewPanel";
import BuildingSiteTab from "@/components/pm/BuildingSiteTab";
import PlansDesignTab from "@/components/pm/PlansDesignTab";
import QuickBoqTab from "@/components/pm/QuickBoqTab";
import SolutionOptionsTab from "@/components/pm/SolutionOptionsTab";
import ProjectFilesTab from "@/components/pm/ProjectFilesTab";
import ReportsShareTab from "@/components/pm/ReportsShareTab";
import ClientEngagementTab from "@/components/pm/ClientEngagementTab";
import SiteDeliveryTab from "@/components/pm/SiteDeliveryTab";
import { Chip } from "@/components/pm/ui";
import { parseSection, WORKSPACE_SECTIONS, type WorkspaceSection } from "@/lib/projectWizard";
import { ArrowLeft } from "lucide-react";

/**
 * Dedicated QS-style workspace for one project. The project id lives in the URL
 * and the section in a query parameter, so refreshing or deep-linking never
 * loses the selected project. Every section reuses the existing components.
 */
const ProjectWorkspace: React.FC = () => {
  const { projectId = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const ws = usePmWorkspace();
  const section = parseSection(params.get("section"));

  const project = ws.projects.find((p) => p.id === projectId) ?? null;
  const client = project ? ws.clients.find((c) => c.id === project.client_id) ?? null : null;
  const site = project ? ws.sites.find((s) => s.id === project.site_id) ?? null : null;

  const setSection = (value: string) => {
    const next = parseSection(value) as WorkspaceSection;
    setParams(next === "overview" ? {} : { section: next }, { replace: true });
  };

  // Section components keep their own project-selection props for reuse elsewhere;
  // here the id is fixed by the URL and the picker is hidden.
  const fixed = { ws, projectId, setProjectId: () => {}, locked: true };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-0 sm:px-2 lg:px-4">
      <Link
        to="/helpdesk/project-management"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to clients &amp; projects
      </Link>

      {ws.loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading project…</p>
      ) : !project ? (
        <div className="mt-6 border border-border p-6">
          <p className="text-sm text-muted-foreground">
            This project could not be found, or you do not have access to it.
          </p>
          <button
            type="button"
            onClick={() => navigate("/helpdesk/project-management")}
            className="mt-4 border border-border px-4 py-2 text-[11px] uppercase tracking-[0.22em]"
          >
            Back to the register
          </button>
        </div>
      ) : (
        <>
          <header className="mb-6 mt-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {client?.display_name ?? "Unassigned client"}
              {site ? ` · ${site.name}` : ""}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
              {project.status && <Chip>{project.status}</Chip>}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {[project.reference, project.address].filter(Boolean).join(" · ") || "No reference captured"}
            </p>
          </header>

          {ws.error && (
            <p className="mb-4 border border-destructive p-3 text-sm text-destructive">
              Could not load workspace: {ws.error}
            </p>
          )}

          <Tabs value={section} onValueChange={setSection}>
            <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1">
              {WORKSPACE_SECTIONS.map((s) => (
                <TabsTrigger key={s.value} value={s.value} className="text-xs uppercase tracking-[0.14em]">
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview">
              <ProjectOverviewPanel ws={ws} project={project} />
            </TabsContent>
            <TabsContent value="building">
              <BuildingSiteTab ws={ws} project={project} />
            </TabsContent>
            <TabsContent value="plans">
              <PlansDesignTab {...fixed} />
            </TabsContent>
            <TabsContent value="boq">
              <QuickBoqTab ws={ws} projectId={projectId} />
            </TabsContent>
            <TabsContent value="options">
              <SolutionOptionsTab projectId={projectId} />
            </TabsContent>
            <TabsContent value="files">
              <ProjectFilesTab {...fixed} />
            </TabsContent>
            <TabsContent value="engagement">
              <ClientEngagementTab projectId={projectId} projectTitle={project.title} />
            </TabsContent>
            <TabsContent value="delivery">
              <SiteDeliveryTab projectId={projectId} projectTitle={project.title} clientId={project.client_id} />
            </TabsContent>
            <TabsContent value="share">
              <ReportsShareTab {...fixed} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ProjectWorkspace;
