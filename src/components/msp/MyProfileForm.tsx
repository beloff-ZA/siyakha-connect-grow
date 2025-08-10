import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function MyProfileForm() {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("display_name, phone")
        .eq("id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (error) return; // silently ignore
      if (prof) {
        setDisplayName(prof.display_name || "");
        setPhone(prof.phone || "");
      } else {
        // Initialize sensible defaults if missing
        const fallback = (user.email ? user.email.split("@")[0] : "");
        setDisplayName(((user.user_metadata as any)?.full_name as string) || fallback);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const update = {
      id: user.id,
      display_name: displayName || null,
      phone: phone || null,
    } as any;

    const { error } = await supabase.from("profiles").upsert(update);
    setLoading(false);
    if (error) {
      toast({ title: "Could not update profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your details have been saved." });
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display_name">Display name</Label>
          <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Jane Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +27 82 123 4567" />
        </div>
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={loading} className="rounded-2xl">Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
