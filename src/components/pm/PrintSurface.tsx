import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

/**
 * Full-screen A4 document surface, portalled to <body> so print CSS can hide
 * every other top-level node. Toolbar controls are marked screen-only and are
 * therefore never printed.
 */
const PrintSurface: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, title, onClose, children }) => {
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("doc-printing");
    return () => document.body.classList.remove("doc-printing");
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="print-surface fixed inset-0 z-[100] overflow-auto bg-white text-black">
      <div className="screen-only sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-300 bg-white px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">{title}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" strokeWidth={1.5} /> Print / Save as PDF
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" strokeWidth={1.5} /> Close
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-[210mm] px-6 py-8 print:px-0 print:py-0">{children}</div>
    </div>,
    document.body,
  );
};

export default PrintSurface;
