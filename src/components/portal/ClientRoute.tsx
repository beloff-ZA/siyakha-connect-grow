import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PortalProvider } from "@/hooks/usePortal";
import { decideClientRoute, resolveAccessProfile, type AccessProfile } from "@/lib/authRouting";
import PortalLayout from "./PortalLayout";

/**
 * Client portal guard. Only an active client membership may enter; admin and
 * project-manager sessions are sent to their own workspace rather than the
 * portal, so the two experiences can never overlap.
 */
const ClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let active = true;
    setProfile(null);
    resolveAccessProfile(user.id).then((p) => {
      if (active) setProfile(p);
    });
    return () => {
      active = false;
    };
  }, [user, attempt]);

  const decision = decideClientRoute({
    loading,
    signedIn: !!user,
    profile,
    pathname: location.pathname,
    mustChangePassword: (user?.user_metadata as Record<string, unknown> | undefined)?.must_change_password === true,
  });

  if (decision.state === "loading")
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground text-sm">
        Loading your portal…
      </div>
    );

  if (decision.state === "error")
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground">{decision.reason}</p>
        <button
          type="button"
          onClick={() => setAttempt((a) => a + 1)}
          className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.22em]"
        >
          Try again
        </button>
      </div>
    );

  if (decision.state === "redirect")
    return <Navigate to={decision.to} replace state={{ from: location.pathname }} />;

  return (
    <PortalProvider>
      <PortalLayout>{children}</PortalLayout>
    </PortalProvider>
  );
};

export default ClientRoute;
