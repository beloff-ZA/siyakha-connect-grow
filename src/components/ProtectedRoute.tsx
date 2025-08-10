import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // optionally a loader
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;

  return children;
};

export default ProtectedRoute;
