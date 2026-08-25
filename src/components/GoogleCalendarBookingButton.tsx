import React, { useEffect, useRef, useState } from "react";

export const GoogleCalendarBookingButton: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load the Google Calendar scheduling stylesheet if not already present.
    const existingLink = document.querySelector('link[href="https://calendar.google.com/calendar/scheduling-button-script.css"]');
    if (!existingLink) {
      const link = document.createElement("link");
      link.href = "https://calendar.google.com/calendar/scheduling-button-script.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    // Load the scheduling script and render the button once ready.
    const scriptId = "google-calendar-scheduling-button";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderButton = () => {
      const cal = (window as typeof window & { calendar?: { schedulingButton?: { load: (opts: Record<string, unknown>) => void } } }).calendar;
      if (!cal?.schedulingButton) {
        setError("Booking calendar is unavailable right now.");
        return;
      }
      cal.schedulingButton.load({
        url: "https://calendar.google.com/calendar/appointments/AcZssZ3M_HaeQ441DUp5YFtjeDq3ITLeax6GUbpUPV8=?gv=true",
        color: "#039BE5",
        label: "Book an appointment",
        target: containerRef.current,
      });
      setLoaded(true);
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://calendar.google.com/calendar/scheduling-button-script.js";
      script.async = true;
      script.onload = renderButton;
      script.onerror = () => setError("Could not load the booking calendar.");
      document.body.appendChild(script);
    } else if (script.readyState === "complete" || script.readyState === "loaded") {
      renderButton();
    } else {
      script.onload = renderButton;
      script.onerror = () => setError("Could not load the booking calendar.");
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-[44px] flex items-center"
      aria-live="polite"
    >
      {!loaded && !error && (
        <span className="text-sm text-muted-foreground">Loading booking calendar…</span>
      )}
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
};
