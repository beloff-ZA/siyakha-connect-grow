
import { PropsWithChildren, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SignInForm from "./SignInForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthGate({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const verified = !!(session?.user?.email_confirmed_at);
      setIsAuthed(!!session && verified);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const verified = !!(session?.user?.email_confirmed_at);
      setIsAuthed(!!session && verified);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  if (!isAuthed) {
    if (typeof window !== 'undefined') {
      window.location.replace('/auth');
    }
    return null;
  }

  return <>{children}</>;
}
