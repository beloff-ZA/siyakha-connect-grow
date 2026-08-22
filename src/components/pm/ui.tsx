import React from "react";

export const selectCls = "h-10 border border-input bg-background px-3 text-sm w-full";

export const Panel: React.FC<{ title: string; actions?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  actions,
  children,
}) => (
  <section className="mb-6 border border-border p-5 md:p-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">{title}</h3>
      {actions}
    </div>
    {children}
  </section>
);

export const Stat: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <div className="border border-border p-4">
    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
    <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label,
  children,
  className,
}) => (
  <div className={`space-y-1.5 ${className ?? ""}`}>
    <label className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</label>
    {children}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={`inline-flex items-center border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${className ?? "border-border text-muted-foreground"}`}>
    {children}
  </span>
);
