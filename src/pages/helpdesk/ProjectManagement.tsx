import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePmWorkspace } from "@/hooks/usePmWorkspace";
import OverviewTab from "@/components/pm/OverviewTab";
import DealsTab from "@/components/pm/DealsTab";
import ProjectsTab from "@/components/pm/ProjectsTab";
import ClientsSitesTab from "@/components/pm/ClientsSitesTab";
import BoqCostingTab from "@/components/pm/BoqCostingTab";
import ProposalsTab from "@/components/pm/ProposalsTab";
import LifecycleTab from "@/components/pm/LifecycleTab";
import AssetsTab from "@/components/pm/AssetsTab";
import ReportsTab from "@/components/pm/ReportsTab";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "deals", label: "Deals" },
  { value: "projects", label: "All projects" },
  { value: "clients", label: "Clients & sites" },
  { value: "boq", label: "BOQ & costing" },
  { value: "proposals", label: "Proposals" },
  { value: "lifecycle", label: "Lifecycle & variations" },
  { value: "assets", label: "Devices & assets" },
  { value: "reports", label: "Reports & pack" },
];


const ProjectManagement: React.FC = () => {
  const ws = usePmWorkspace();
  const [tab, setTab] = useState("overview");
  const [projectId, setProjectId] = useState("");

  const openProject = (id: string, target: string) => {
    setProjectId(id);
    setTab(target);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Siyakha Technology Solutions</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Project management &amp; commercial workspace</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Pipeline, clients, sites, projects, bills of quantities, proposals and official costings in one protected
          workspace. Documents are generated for download and manual review — nothing is emailed automatically.
        </p>
      </header>

      {ws.error && (
        <p className="mb-4 border border-destructive p-3 text-sm text-destructive">Could not load workspace: {ws.error}</p>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs uppercase tracking-[0.14em]">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ws.loading ? (
          <p className="text-sm text-muted-foreground">Loading workspace…</p>
        ) : (
          <>
            <TabsContent value="overview">
              <OverviewTab ws={ws} go={setTab} />
            </TabsContent>
            <TabsContent value="deals">
              <DealsTab ws={ws} openProject={openProject} />
            </TabsContent>
            <TabsContent value="projects">
              <ProjectsTab ws={ws} openProject={openProject} />
            </TabsContent>
            <TabsContent value="clients">
              <ClientsSitesTab ws={ws} openProject={openProject} />
            </TabsContent>
            <TabsContent value="boq">
              <BoqCostingTab ws={ws} projectId={projectId} setProjectId={setProjectId} />
            </TabsContent>
            <TabsContent value="proposals">
              <ProposalsTab ws={ws} initialProjectId={projectId} />
            </TabsContent>
            <TabsContent value="lifecycle">
              <LifecycleTab ws={ws} projectId={projectId} setProjectId={setProjectId} />
            </TabsContent>
            <TabsContent value="assets">
              <AssetsTab ws={ws} projectId={projectId} setProjectId={setProjectId} />
            </TabsContent>
            <TabsContent value="reports">
              <ReportsTab ws={ws} projectId={projectId} setProjectId={setProjectId} />
            </TabsContent>

          </>
        )}
      </Tabs>
    </div>
  );
};

export default ProjectManagement;
