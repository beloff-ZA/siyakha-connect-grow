import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SURVEY_CONDITIONS,
  SURVEY_STATUSES,
  type SiteSurvey,
  type SurveyCabinetRow,
  type SurveyLanRow,
} from "@/lib/siteSurvey";

type Props = {
  survey: SiteSurvey;
  onChange: (next: SiteSurvey) => void;
};

const Picker: React.FC<{ value: string; options: string[]; onChange: (v: string) => void; label: string }> = ({
  value,
  options,
  onChange,
  label,
}) => (
  <select
    aria-label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-11 w-full rounded-md border border-input bg-background px-2 text-sm"
  >
    {options.map((o) => (
      <option key={o || "blank"} value={o}>
        {o || "—"}
      </option>
    ))}
  </select>
);

/** On-site survey sheet: cabinet checks and LAN checks, exactly as the customer's form asks. */
const SiteSurveyForm: React.FC<Props> = ({ survey, onChange }) => {
  const set = <K extends keyof SiteSurvey>(key: K, value: SiteSurvey[K]) => onChange({ ...survey, [key]: value });

  const setCabinet = (i: number, patch: Partial<SurveyCabinetRow>) =>
    onChange({ ...survey, cabinet: survey.cabinet.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });

  const setLan = (i: number, patch: Partial<SurveyLanRow>) =>
    onChange({ ...survey, lan: survey.lan.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Survey date</Label>
          <Input type="date" value={survey.survey_date} onChange={(e) => set("survey_date", e.target.value)} />
        </div>
        <div>
          <Label>Customer</Label>
          <Input value={survey.customer} onChange={(e) => set("customer", e.target.value)} />
        </div>
        <div>
          <Label>Site / branch</Label>
          <Input value={survey.site_branch} onChange={(e) => set("site_branch", e.target.value)} />
        </div>
        <div>
          <Label>Site contact</Label>
          <Input value={survey.site_contact} onChange={(e) => set("site_contact", e.target.value)} />
        </div>
        <div>
          <Label>Engineer</Label>
          <Input value={survey.engineer} onChange={(e) => set("engineer", e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide">Cabinet — photos are required</p>
        <div className="space-y-4">
          {survey.cabinet.map((row, i) => (
            <div key={row.item} className="rounded-md border border-border p-3 space-y-3">
              <p className="text-sm font-medium">{row.item}</p>
              <div className="grid gap-3 sm:grid-cols-[2fr_80px_1fr]">
                <div>
                  <Label className="text-xs">Description</Label>
                  <Input
                    className="min-h-11"
                    value={row.description}
                    onChange={(e) => setCabinet(i, { description: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Qty</Label>
                  <Input className="min-h-11" value={row.qty} onChange={(e) => setCabinet(i, { qty: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Picker
                    label={`${row.item} status`}
                    value={row.status}
                    options={SURVEY_STATUSES}
                    onChange={(v) => setCabinet(i, { status: v })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Comment</Label>
                <Input
                  className="min-h-11"
                  value={row.comment}
                  onChange={(e) => setCabinet(i, { comment: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide">LAN — photos are required</p>
        <div className="space-y-4">
          {survey.lan.map((row, i) => (
            <div key={row.item} className="rounded-md border border-border p-3 space-y-3">
              <p className="text-sm font-medium">{row.item}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className="text-xs">Description</Label>
                  <Input
                    className="min-h-11"
                    value={row.description}
                    onChange={(e) => setLan(i, { description: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Location</Label>
                  <Input
                    className="min-h-11"
                    value={row.location}
                    onChange={(e) => setLan(i, { location: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Condition</Label>
                  <Picker
                    label={`${row.item} condition`}
                    value={row.condition}
                    options={SURVEY_CONDITIONS}
                    onChange={(v) => setLan(i, { condition: v })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Comment</Label>
                <Input className="min-h-11" value={row.comment} onChange={(e) => setLan(i, { comment: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Survey notes</Label>
        <Textarea rows={4} value={survey.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>

      <label className="flex items-start gap-3 text-sm">
        <Checkbox
          checked={survey.photos_taken}
          onCheckedChange={(v) => set("photos_taken", Boolean(v))}
          className="mt-0.5"
        />
        <span>Site photos of the cabinet and LAN were taken and uploaded under “Forms &amp; files”.</span>
      </label>
    </div>
  );
};

export default SiteSurveyForm;
