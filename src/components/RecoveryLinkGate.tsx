import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATH_RESET_PASSWORD, shouldRedirectToRecovery } from "@/lib/recoveryLink";

/**
 * A genuine recovery link may land on any legacy URL (/sign-in, /auth,
 * /client-login or /). This forces that page load onto the dedicated recovery
 * screen so it can never silently fall through to the ordinary app.
 */
const RecoveryLinkGate: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldRedirectToRecovery(pathname)) navigate(PATH_RESET_PASSWORD, { replace: true });
  }, [pathname, navigate]);

  return null;
};

export default RecoveryLinkGate;
