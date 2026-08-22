import React from "react";
import { formatQty, formatZar } from "@/lib/boq";
import { formatDate } from "@/lib/portalFiles";
import { SIYAKHA, PROPOSAL_DEFAULTS } from "@/lib/proposals";
import { assetStatusLabel, deviceTypeLabel, lineKindLabel, NOT_PROCURED, packSectionFlags, stageLabel } from "@/lib/lifecycle";
import type { ProjectPack } from "@/lib/projectPack";
import PlanSheet from "./PlanSheet";

/** Page-level block. Adds a print page break before every section but the first. */
const Page: React.FC<{ title?: string; first?: boolean; children: React.ReactNode }> = ({ title, first, children }) => (
  <section className={`print-block mb-8 ${first ? "" : "break-before-page"}`}>
    {title && (
      <h2 className="mb-3 border-b border-black pb-1 text-[11pt] font-semibold uppercase tracking-[0.12em]">{title}</h2>
    )}
    {children}
  </section>
);

const Block: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="print-block mb-4">
    <p className="mb-1 text-[8pt] uppercase tracking-[0.18em] text-neutral-500">{title}</p>
    <div className="text-[9.5pt] leading-relaxed">{children}</div>
  </div>
);

const Lines: React.FC<{ text?: string | null; fallback?: string }> = ({ text, fallback }) => {
  const value = (text ?? "").trim() || fallback || "";
  if (!value) return <p className="text-neutral-500">To be confirmed.</p>;
  return (
    <>
      {value.split("\n").map((l, i) => (
        <p key={i} className="mb-1">
          {l}
        </p>
      ))}
    </>
  );
};

const Table: React.FC<{ head: string[]; rows: (string | number | null | undefined)[][]; empty?: string }> = ({
  head,
  rows,
  empty,
}) => {
  if (!rows.length) return <p className="text-[9pt] text-neutral-500">{empty ?? "No records captured yet."}</p>;
  return (
    <table className="w-full border-collapse text-[8.5pt]">
      <thead>
        <tr className="border-y border-black text-left">
          {head.map((h) => (
            <th key={h} className="py-1 pr-2 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-neutral-300 align-top">
            {r.map((c, ci) => (
              <td key={ci} className="py-1 pr-2">
                {c === null || c === undefined || c === "" ? "—" : c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 * Client-facing A4 project pack. Built only from a client-safe snapshot, so
 * supplier identity, supplier cost, markup, margin and internal notes can never
 * be printed here.
 */
const ProjectPackDocument: React.FC<{ pack: ProjectPack }> = ({ pack }) => {
  const { project, client, site, narrative, floors, boq, boqLines, totals } = pack;
  const flags = packSectionFlags(pack.lifecycle_stage);

  const base = boqLines.filter((l) => l.line_kind === "base");
  const alternatives = boqLines.filter((l) => l.line_kind === "alternative");
  const provisional = boqLines.filter((l) => l.line_kind === "provisional" || l.line_kind === "contingency");
  const exclusionLines = boqLines.filter((l) => l.line_kind === "exclusion");

  const markers = floors.flatMap((f) => f.markers.map((m) => ({ ...m, floor: f.display_name })));
  const cameras = markers.filter((m) => m.marker_type === "camera");
  const aps = markers.filter((m) => m.marker_type === "wifi_ap");
  const nvrById = new Map(pack.nvrs.map((n: any) => [n.id, n]));
  const floorName = new Map(floors.map((f) => [f.id, f.display_name]));

  const disciplineRows = Object.entries(
    markers.reduce<Record<string, Record<string, number>>>((acc, m) => {
      const disc = (acc[m.discipline] ??= {});
      const key = `${deviceTypeLabel(m.marker_type)}${m.model ? ` — ${m.model}` : ""}`;
      disc[key] = (disc[key] ?? 0) + 1;
      return acc;
    }, {}),
  );

  const cableTotal = pack.cables.reduce(
    (s: number, c: any) => s + Number(c.measured_length_m ?? c.estimated_length_m ?? 0),
    0,
  );

  const progressRows = base
    .filter((l) => l.qty_procured || l.qty_received || l.qty_installed || l.qty_tested || l.qty_commissioned)
    .map((l) => [
      l.item_code,
      l.description,
      formatQty(l.quantity),
      formatQty(l.qty_procured),
      formatQty(l.qty_received),
      formatQty(l.qty_installed),
      formatQty(l.qty_tested),
      formatQty(l.qty_commissioned),
    ]);

  return (
    <article className="doc-root bg-white text-black">
      {/* Cover */}
      <Page first>
        <div className="flex min-h-[150mm] flex-col justify-between">
          <div>
            <p className="text-[16pt] font-bold uppercase tracking-[0.16em]">{SIYAKHA.company}</p>
            <p className="mt-1 max-w-[130mm] text-[9pt] text-neutral-600">{SIYAKHA.positioning}</p>
          </div>
          <div>
            <p className="text-[9pt] uppercase tracking-[0.24em] text-neutral-500">Full project pack</p>
            <h1 className="mt-2 text-[22pt] font-semibold leading-tight">{project.title}</h1>
            <p className="mt-2 text-[11pt]">{client?.display_name ?? "—"}</p>
            <p className="text-[10pt] text-neutral-700">{site?.name ?? project.address ?? ""}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-black pt-3 text-[9pt]">
              <div>
                <p className="text-neutral-500">Project stage</p>
                <p className="font-semibold">{stageLabel(pack.lifecycle_stage)}</p>
              </div>
              <div>
                <p className="text-neutral-500">Revision</p>
                <p className="font-semibold">Rev {pack.revision_no || 1}</p>
              </div>
              <div>
                <p className="text-neutral-500">Reference</p>
                <p className="font-semibold">{project.reference ?? "—"}</p>
              </div>
              <div>
                <p className="text-neutral-500">Issued</p>
                <p className="font-semibold">{formatDate(pack.generated_at)}</p>
              </div>
            </div>
          </div>
          <p className="mt-8 text-[8pt] text-neutral-600">
            {SIYAKHA.email} · {SIYAKHA.website} · {SIYAKHA.phone}
          </p>
        </div>
      </Page>

      {/* Document control */}
      <Page title="Document control">
        <Table
          head={["Item", "Detail"]}
          rows={[
            ["Document", `Full project pack — ${project.title}`],
            ["Revision", `Rev ${pack.revision_no || 1}`],
            ["Project stage", stageLabel(pack.lifecycle_stage)],
            ["Issued by", SIYAKHA.company],
            ["Issue date", formatDate(pack.generated_at)],
            ["Proposal reference", narrative.proposal_number ? `${narrative.proposal_number} ${narrative.proposal_revision ?? ""}` : "—"],
            ["BOQ revision", boq ? `${boq.revision_label} (v${boq.version_no})` : "—"],
            ["Current plan revisions", pack.planRevisions.filter((r: any) => r.is_current).length || "—"],
            ["Validity", narrative.validity_days ? `${narrative.validity_days} days from issue` : "30 days from issue"],
          ]}
        />
        <p className="mt-4 text-[8.5pt] text-neutral-600">
          This pack is a frozen snapshot of the project record at the issue date above. Superseded revisions remain on
          file and are available on request.
        </p>
      </Page>

      {/* Client / site / project profile */}
      <Page title="Client, site and project profile">
        <div className="grid grid-cols-2 gap-6 text-[9.5pt]">
          <div>
            <Block title="Client">
              <p className="font-semibold">{client?.display_name ?? "—"}</p>
              {client?.contact_name && <p>{client.contact_name}</p>}
              {client?.contact_email && <p>{client.contact_email}</p>}
              {client?.phone && <p>{client.phone}</p>}
            </Block>
            <Block title="Site">
              <p className="font-semibold">{site?.name ?? "—"}</p>
              {site?.address && <p>{site.address}</p>}
              <p>{[site?.city, site?.province].filter(Boolean).join(", ")}</p>
              {site?.venue_type && <p>Venue type: {site.venue_type}</p>}
            </Block>
          </div>
          <div>
            <Block title="Project">
              <p className="font-semibold">{project.title}</p>
              <p>Reference: {project.reference ?? "—"}</p>
              <p>Consultant: {project.consultant ?? "—"}</p>
              <p>Planned start: {formatDate(project.start_date ?? narrative.planned_start_date)}</p>
              <p>Target completion: {formatDate(project.target_date ?? narrative.planned_completion_date)}</p>
            </Block>
            <Block title="Stakeholders">
              <Lines text={project.stakeholders} fallback="To be confirmed." />
            </Block>
          </div>
        </div>
      </Page>

      {/* Executive summary + design */}
      <Page title="Executive summary">
        <Block title="Summary">
          <Lines
            text={narrative.executive_summary ?? project.planning_narrative}
            fallback={`Siyakha Technology Solutions has designed a structured technology infrastructure solution for ${
              site?.name ?? project.title
            }, covering ${floors.length} area(s) and ${markers.length} planned devices. The design is documented per level with mapped device positions, schedules and a priced bill of quantities.`}
          />
        </Block>
        <Block title="Current stage">
          <p>{stageLabel(pack.lifecycle_stage)}</p>
        </Block>
        <Block title="Project understanding">
          <Lines text={narrative.project_understanding ?? project.site_context} />
        </Block>
        <Block title="Design objectives">
          <Lines text={project.objectives} />
        </Block>
        <Block title="Design concept">
          <Lines
            text={project.design_concept}
            fallback="A centralised network core feeds each level over fibre backbone, with PoE edge switching serving cameras, access points and data points. Cabling is installed on dedicated containment, labelled and certified per point."
          />
        </Block>
      </Page>

      {/* Scope by discipline */}
      <Page title="Scope of works by discipline">
        <Block title="Scope statement">
          <Lines text={narrative.scope_of_work} />
        </Block>
        {disciplineRows.map(([discipline, items]) => (
          <div key={discipline} className="print-block mb-4">
            <p className="mb-1 text-[9.5pt] font-semibold">{discipline}</p>
            <Table head={["Product / system", "Planned quantity"]} rows={Object.entries(items).map(([k, v]) => [k, v])} />
          </div>
        ))}
      </Page>

      {/* Project approach */}
      <Page title="Project approach and programme">
        <Block title="Methodology">
          <Lines text={narrative.methodology ?? project.project_approach} fallback={PROPOSAL_DEFAULTS.methodology} />
        </Block>
        <Block title="Deliverables">
          <Lines text={narrative.deliverables} fallback={PROPOSAL_DEFAULTS.deliverables} />
        </Block>
        <Block title="Programme milestones">
          <Table
            head={["Milestone", "Due", "Status"]}
            rows={pack.milestones.map((m: any) => [m.title, formatDate(m.due_date), m.status])}
            empty="Programme milestones will be confirmed on award."
          />
        </Block>
      </Page>

      {/* Floor / area schedule */}
      <Page title="Floor and area schedule">
        <Table
          head={["Level", "Area / level name", "Use", "Cameras", "Access points", "Data points", "Racks", "Total devices"]}
          rows={floors.map((f) => {
            const t = (k: string) => f.markers.filter((m) => m.marker_type === k).length;
            return [f.level_number, f.display_name, deviceTypeLabel(f.floor_use), t("camera"), t("wifi_ap"), t("data_point"), t("rack"), f.markers.length];
          })}
        />
        <p className="mt-3 text-[8.5pt] text-neutral-600">
          Total planned devices: {markers.length}. Mapped on plan: {markers.filter((m) => m.is_placed).length}.
        </p>
      </Page>

      {/* Plan sheets */}
      {floors.map((f) => (
        <Page key={f.id} title={`Layout plan — ${f.display_name}`}>
          <PlanSheet floor={f} />
          <div className="mt-3">
            <Table
              head={["Tag", "Type", "Model", "Area", "Status"]}
              rows={f.markers.map((m) => [m.label, deviceTypeLabel(m.marker_type), m.model, m.area, m.status])}
              empty="No devices allocated to this level yet."
            />
          </div>
        </Page>
      ))}

      {/* Device schedule */}
      <Page title="Device and equipment schedule">
        <Table
          head={["Tag", "Discipline", "Type", "Model", "Level", "Area", "Serial", "Status"]}
          rows={markers.map((m) => [
            m.label,
            m.discipline,
            deviceTypeLabel(m.marker_type),
            m.model ?? m.equipment,
            m.floor,
            m.area,
            m.asset?.serial_number ?? m.serial_number ?? NOT_PROCURED,
            m.asset ? assetStatusLabel(m.asset.lifecycle_status) : m.status,
          ])}
        />
      </Page>

      {/* Camera schedule */}
      {cameras.length > 0 && (
        <Page title="CCTV camera schedule">
          <Table
            head={["Tag", "Level", "Model", "Lens", "Mount height", "Direction", "FOV", "NVR", "Channel", "Status"]}
            rows={cameras.map((m) => [
              m.label,
              m.floor,
              m.model,
              m.lens_model,
              m.mounting_height_m ? `${m.mounting_height_m} m` : null,
              m.direction_deg !== null ? `${m.direction_deg}°` : null,
              m.fov_deg ? `${m.fov_deg}°` : null,
              m.asset?.nvr_label ?? (m.nvr_id ? (nvrById.get(m.nvr_id) as any)?.label : null),
              m.asset?.nvr_channel ?? m.nvr_channel,
              m.asset ? assetStatusLabel(m.asset.lifecycle_status) : m.status,
            ])}
          />
          <div className="mt-4">
            <p className="mb-1 text-[9.5pt] font-semibold">Recording platform</p>
            <Table
              head={["NVR", "Manufacturer", "Model", "Channels", "Range", "Status"]}
              rows={pack.nvrs.map((n: any) => [
                n.label,
                n.manufacturer,
                n.model,
                n.channel_count,
                n.channel_from && n.channel_to ? `${n.channel_from}–${n.channel_to}` : null,
                n.status,
              ])}
            />
          </div>
        </Page>
      )}

      {/* Wi-Fi schedule */}
      {aps.length > 0 && (
        <Page title="Wireless access point schedule">
          <Table
            head={["Tag", "Level", "Model", "Radio", "SSID", "VLAN", "Switch port", "Status"]}
            rows={aps.map((m) => [
              m.label,
              m.floor,
              m.model,
              m.radio_band,
              m.ssid,
              m.vlan,
              m.asset?.switch_port ?? m.switch_port,
              m.asset ? assetStatusLabel(m.asset.lifecycle_status) : m.status,
            ])}
          />
        </Page>
      )}

      {/* Cable schedule */}
      <Page title="Cable and route schedule">
        <Table
          head={["Route", "Level", "Service", "Cable type", "From", "To", "Length (m)", "Patch panel", "Port", "Status"]}
          rows={pack.cables.map((c: any) => [
            c.route_label,
            floorName.get(c.floor_id) ?? "—",
            c.service_type,
            c.cable_type,
            c.source_label,
            c.destination_label,
            c.measured_length_m ?? c.estimated_length_m,
            c.patch_panel,
            c.patch_panel_port ?? c.switch_port,
            c.status,
          ])}
        />
        <p className="mt-3 text-[8.5pt] text-neutral-600">
          {pack.cables.length} routes scheduled · indicative total run length {Math.round(cableTotal)} m.
        </p>
      </Page>

      {/* Rack schedule */}
      <Page title="Rack, switch and port schedule">
        <Table
          head={["Rack", "Equipment", "Manufacturer", "Model", "U", "Qty", "Ports", "PoE", "Status"]}
          rows={pack.rackEquipment.map((e: any) => [
            markers.find((m) => m.id === e.rack_marker_id)?.label ?? "—",
            deviceTypeLabel(e.equipment_type),
            e.manufacturer,
            e.model,
            e.rack_units,
            e.quantity,
            e.port_count ? `${e.port_count} × ${e.port_type ?? ""}`.trim() : null,
            e.poe_capable ? "Yes" : "No",
            e.status,
          ])}
        />
      </Page>

      {/* BOQ */}
      <Page title="Bill of quantities and pricing">
        {boq && (
          <p className="mb-2 text-[9pt] text-neutral-600">
            {boq.title} · {boq.revision_label} (v{boq.version_no}) · valid until {formatDate(boq.valid_until)}
          </p>
        )}
        {Array.from(new Set(base.map((l) => l.section))).map((section) => (
          <div key={section} className="print-block mb-4">
            <p className="mb-1 text-[9.5pt] font-semibold uppercase tracking-[0.08em]">{section}</p>
            <Table
              head={["Code", "Description", "Qty", "Unit", "Rate", "Amount"]}
              rows={base
                .filter((l) => l.section === section)
                .map((l) => [l.item_code, l.description, formatQty(l.quantity), l.unit, formatZar(l.customer_unit_rate), formatZar(l.line_total)])}
            />
          </div>
        ))}
        <table className="ml-auto mt-2 w-[80mm] border-collapse text-[9.5pt]">
          <tbody>
            <tr className="border-t border-black">
              <td className="py-1">Subtotal (excl. VAT)</td>
              <td className="py-1 text-right tabular-nums">{formatZar(totals.subtotal)}</td>
            </tr>
            <tr>
              <td className="py-1">VAT @ {boq?.vat_rate ?? 15}%</td>
              <td className="py-1 text-right tabular-nums">{formatZar(totals.vat)}</td>
            </tr>
            <tr className="border-y-2 border-black font-semibold">
              <td className="py-1.5">Total (incl. VAT)</td>
              <td className="py-1.5 text-right tabular-nums">{formatZar(totals.total)}</td>
            </tr>
          </tbody>
        </table>
        {boq?.notes && <p className="mt-3 text-[8.5pt] text-neutral-700">{boq.notes}</p>}
      </Page>

      {/* Options / allowances */}
      {(alternatives.length > 0 || provisional.length > 0 || exclusionLines.length > 0 || pack.variations.length > 0) && (
        <Page title="Options, allowances and variations">
          {alternatives.length > 0 && (
            <div className="print-block mb-4">
              <p className="mb-1 text-[9.5pt] font-semibold">Optional alternatives (not included in the total above)</p>
              <Table
                head={["Description", "Qty", "Unit", "Rate", "Amount"]}
                rows={alternatives.map((l) => [l.description, formatQty(l.quantity), l.unit, formatZar(l.customer_unit_rate), formatZar(l.line_total)])}
              />
            </div>
          )}
          {provisional.length > 0 && (
            <div className="print-block mb-4">
              <p className="mb-1 text-[9.5pt] font-semibold">Provisional sums, allowances and contingencies</p>
              <Table
                head={["Type", "Description", "Amount"]}
                rows={provisional.map((l) => [lineKindLabel(l.line_kind), l.description, formatZar(l.line_total)])}
              />
            </div>
          )}
          {exclusionLines.length > 0 && (
            <div className="print-block mb-4">
              <p className="mb-1 text-[9.5pt] font-semibold">Priced exclusions</p>
              <Table head={["Description"]} rows={exclusionLines.map((l) => [l.description])} />
            </div>
          )}
          {pack.variations.length > 0 && (
            <div className="print-block">
              <p className="mb-1 text-[9.5pt] font-semibold">Variation / change register</p>
              <Table
                head={["Ref", "Title", "Discipline", "Raised", "Status", "Amount"]}
                rows={pack.variations.map((v: any) => [
                  v.reference,
                  v.title,
                  v.discipline,
                  formatDate(v.raised_on),
                  v.status,
                  formatZar(Number(v.customer_amount ?? 0)),
                ])}
              />
            </div>
          )}
        </Page>
      )}

      {/* Delivery-phase sections */}
      {flags.procurement && (
        <Page title="Procurement and delivery progress">
          <Table
            head={["Code", "Item", "Planned", "Procured", "Received", "Installed", "Tested", "Commissioned"]}
            rows={progressRows}
            empty="Procurement quantities have not been captured yet."
          />
        </Page>
      )}

      {flags.installation && (
        <Page title="Installation progress">
          <Table
            head={["Tag", "Type", "Level", "Installer", "Installed on", "Status"]}
            rows={markers
              .filter((m) => m.asset?.installed_on || m.asset?.lifecycle_status === "installed")
              .map((m) => [m.label, deviceTypeLabel(m.marker_type), m.floor, m.asset?.installer, formatDate(m.asset?.installed_on), assetStatusLabel(m.asset?.lifecycle_status)])}
            empty="No installations recorded yet."
          />
        </Page>
      )}

      {flags.testing && (
        <Page title="Testing and commissioning results">
          <Table
            head={["Tag", "Type", "Level", "Test result", "Tested on", "Commissioned on"]}
            rows={markers
              .filter((m) => m.asset?.test_result || m.asset?.tested_on || m.asset?.commissioned_on)
              .map((m) => [m.label, deviceTypeLabel(m.marker_type), m.floor, m.asset?.test_result, formatDate(m.asset?.tested_on), formatDate(m.asset?.commissioned_on)])}
            empty="No test or commissioning results recorded yet."
          />
        </Page>
      )}

      {flags.handover && (
        <Page title="Asset register for handover">
          <Table
            head={["Tag", "Type", "Level", "Manufacturer", "Model", "Serial", "MAC", "IP", "Warranty expiry"]}
            rows={markers.map((m) => [
              m.label,
              deviceTypeLabel(m.marker_type),
              m.floor,
              m.asset?.manufacturer,
              m.asset?.model ?? m.model,
              m.asset?.serial_number ?? m.serial_number ?? NOT_PROCURED,
              m.asset?.mac_address ?? m.mac_address ?? NOT_PROCURED,
              m.asset?.ip_address ?? NOT_PROCURED,
              formatDate(m.asset?.warranty_expiry),
            ])}
          />
        </Page>
      )}

      {/* Tasks, risks, queries */}
      <Page title="Tasks, risks, assumptions and open queries">
        <div className="print-block mb-4">
          <p className="mb-1 text-[9.5pt] font-semibold">Tasks</p>
          <Table
            head={["Task", "Owner", "Priority", "Due", "Status"]}
            rows={pack.tasks.map((t: any) => [t.title, t.owner, t.priority, formatDate(t.due_date), t.status])}
          />
        </div>
        <Block title="Risks">
          <Lines text={project.risks_notes} fallback="No material risks recorded at the time of issue." />
        </Block>
        <Block title="Assumptions">
          <Lines text={narrative.assumptions} fallback={PROPOSAL_DEFAULTS.assumptions} />
        </Block>
        <Block title="Exclusions">
          <Lines text={narrative.exclusions} fallback={PROPOSAL_DEFAULTS.exclusions} />
        </Block>
        <div className="print-block">
          <p className="mb-1 text-[9.5pt] font-semibold">Open queries</p>
          <Table
            head={["Subject", "Raised", "Status"]}
            rows={pack.queries.map((q: any) => [q.subject, formatDate(q.created_at), q.status])}
            empty="No open queries."
          />
        </div>
      </Page>

      {/* Revision history */}
      <Page title="Revision history">
        <div className="print-block mb-4">
          <p className="mb-1 text-[9.5pt] font-semibold">Plan revisions</p>
          <Table
            head={["Revision", "Level", "Status", "Current", "Issued"]}
            rows={pack.planRevisions.map((r: any) => [
              r.revision_label,
              floorName.get(r.floor_id) ?? "Project-wide",
              r.review_status,
              r.is_current ? "Yes" : "No",
              formatDate(r.created_at),
            ])}
          />
        </div>
        <div className="print-block mb-4">
          <p className="mb-1 text-[9.5pt] font-semibold">Proposal and BOQ revisions</p>
          <Table
            head={["Proposal", "Revision", "Status", "Issued"]}
            rows={pack.proposals.map((p: any) => [p.proposal_number, p.revision_label, p.status, formatDate(p.issued_at ?? p.created_at)])}
          />
        </div>
        <div className="print-block">
          <p className="mb-1 text-[9.5pt] font-semibold">Stage history</p>
          <Table
            head={["From", "To", "Note", "Date"]}
            rows={pack.stageHistory.map((h: any) => [stageLabel(h.from_stage), stageLabel(h.to_stage), h.note, formatDate(h.created_at)])}
            empty="No stage changes recorded."
          />
        </div>
      </Page>

      {/* Terms and acceptance */}
      <Page title="Terms and acceptance">
        <Block title="Warranty">
          <Lines text={narrative.warranty_terms} fallback={PROPOSAL_DEFAULTS.warranty_terms} />
        </Block>
        <Block title="Payment terms">
          <Lines text={narrative.payment_terms} fallback={PROPOSAL_DEFAULTS.payment_terms} />
        </Block>
        <Block title="Validity">
          <p>This pack and its pricing remain valid for {narrative.validity_days ?? 30} days from {formatDate(pack.generated_at)}.</p>
        </Block>
        <div className="mt-10 grid grid-cols-2 gap-10 text-[9pt]">
          <div>
            <p className="border-b border-black pb-8" />
            <p className="mt-1">For and on behalf of {client?.display_name ?? "the client"}</p>
            <p className="text-neutral-600">Name, signature and date</p>
          </div>
          <div>
            <p className="border-b border-black pb-8" />
            <p className="mt-1">For and on behalf of {SIYAKHA.company}</p>
            <p className="text-neutral-600">Name, signature and date</p>
          </div>
        </div>
        <footer className="mt-10 border-t border-black pt-3 text-[8pt] text-neutral-700">
          <p className="font-semibold uppercase tracking-[0.16em]">{SIYAKHA.company}</p>
          <p>
            {SIYAKHA.email} · {SIYAKHA.website} · {SIYAKHA.phone}
          </p>
        </footer>
      </Page>
    </article>
  );
};

export default ProjectPackDocument;
