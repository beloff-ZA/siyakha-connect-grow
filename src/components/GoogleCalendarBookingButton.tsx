import React, { useState } from "react";
import { CalendarCheck, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TECHNICIAN_BOOKING_LABEL, TECHNICIAN_BOOKING_URL } from "@/lib/booking";

export const GoogleCalendarBookingButton: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyBookingLink = async () => {
    try {
      await navigator.clipboard.writeText(TECHNICIAN_BOOKING_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.location.assign(TECHNICIAN_BOOKING_URL);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center" aria-live="polite">
      <Button asChild className="w-full sm:w-auto">
        <a href={TECHNICIAN_BOOKING_URL} target="_blank" rel="noopener noreferrer">
          <CalendarCheck className="h-4 w-4" strokeWidth={1.5} />
          {TECHNICIAN_BOOKING_LABEL}
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
        </a>
      </Button>
      <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={copyBookingLink}>
        <Copy className="h-4 w-4" strokeWidth={1.5} />
        {copied ? "Link copied" : "Copy booking link"}
      </Button>
    </div>
  );
};
