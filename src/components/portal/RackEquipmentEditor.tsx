import React from "react";
import { History, Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { RackEquipment } from "@/lib/rackEquipment";

type HistoryRow = {
  id: string;
  action: string;
  detail: string | null;
  created_at: string;
};

const STATUSES = ["planned", "installed", "tested", "active"] as const;

/**
 * Admin-only editor for a rack equipment record: status, serial number, MAC
 * address and rack position. Every save is captured by the database audit
 * trigger and the recent history is shown inline.
 */
export const RackEquipmentEditor: React.FC<{
  item: RackEquipment;
  onSaved?: () => void;
}> = ({ item, onSaved }) => {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [history, setHistory] = React.useState<HistoryRow[]>([]);
  const [status, setStatus] = React.useState(item.status);
  const [serial, setSerial] = React.useState(item.serial_number ?? "");
  const [mac, setMac] = React.useState(item.mac_address ?? "");
  const [position, setPosition] = React.useState(
    String(item.rack_position ?? item.sort_order ?? 1),
  );

  React.useEffect(() => {
    if (!open) return;
    setStatus(item.status);
    setSerial(item.serial_number ?? "");
    setMac(item.mac_address ?? "");
    setPosition(String(item.rack_position ?? item.sort_order ?? 1));
    void (async () => {
      const { data } = await supabase
        .from("portal_rack_equipment_history")
        .select("id, action, detail, created_at")
        .eq("equipment_id", item.id)
        .order("created_at", { ascending: false })
        .limit(8);
      setHistory((data ?? []) as HistoryRow[]);
    })();
  }, [open, item]);

  const save = async () => {
    const pos = Number(position);
    if (!Number.isFinite(pos) || pos < 1 || pos > 6) {
      toast.error("Rack position must be a U slot between 1 and 6.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("portal_rack_equipment")
      .update({
        status: status as RackEquipment["status"],
        serial_number: serial.trim() || null,
        mac_address: mac.trim() || null,
        rack_position: pos,
        sort_order: pos,
      } as never)
      .eq("id", item.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Equipment record updated");
    setOpen(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[10px] uppercase tracking-[0.18em]">
          <Pencil className="h-3 w-3" strokeWidth={1.5} /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-light tracking-tight">
            {item.manufacturer} {item.model}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {item.role ?? item.equipment_type} · serial numbers and MAC addresses are captured at
            commissioning only.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.2em]">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.2em]">Rack position (U)</Label>
            <Input
              value={position}
              inputMode="numeric"
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.2em]">Serial number</Label>
            <Input value={serial} placeholder="TBC" onChange={(e) => setSerial(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.2em]">MAC address</Label>
            <Input value={mac} placeholder="TBC" onChange={(e) => setMac(e.target.value)} />
          </div>
        </div>

        <div className="border-t border-border pt-3 space-y-2">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <History className="h-3 w-3" strokeWidth={1.5} /> Audit history
          </p>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground">No changes recorded yet.</p>
          ) : (
            <ul className="space-y-1.5 max-h-40 overflow-y-auto">
              {history.map((h) => (
                <li key={h.id} className="text-xs text-muted-foreground">
                  <span className="text-foreground">{h.action.replace(/_/g, " ")}</span> ·{" "}
                  {new Date(h.created_at).toLocaleString()}
                  {h.detail ? ` · ${h.detail}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
