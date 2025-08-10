
import { PropsWithChildren, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SignInForm from "./SignInForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthGate({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  if (!isAuthed) {
    return (
      <div className="w-full flex justify-center py-10">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Sign in to manage calls</CardTitle>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
