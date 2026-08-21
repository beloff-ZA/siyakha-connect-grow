import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PortalProvider } from "@/hooks/usePortal";
import PortalLayout from "./PortalLayout";

const ClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground text-sm">
        Loading your portal…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/client-login" replace state={{ from: location.pathname }} />;
  }

  return (
    <PortalProvider>
      <PortalLayout>{children}</PortalLayout>
    </PortalProvider>
  );
};

export default ClientRoute;
