import React from "react";
import { statusLabel } from "@/hooks/usePortal";

export const PageHeader: React.FC<{ eyebrow?: string; title: string; description?: string }> = ({
  eyebrow,
  title,
  description,
}) => (
  <header className="mb-10">
    {eyebrow && (
      <p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-3">{eyebrow}</p>
    )}
    <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight">{title}</h1>
    {description && (
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
    )}
  </header>
);

export const StatusPill: React.FC<{ status?: string | null }> = ({ status }) => (
  <span className="inline-flex items-center border border-border px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    {statusLabel(status)}
  </span>
);

export const Panel: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = "",
}) => (
  <section className={`border border-border p-6 md:p-8 ${className}`}>
    {title && (
      <h2 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-4">{title}</h2>
    )}
    {children}
  </section>
);

export const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="border border-dashed border-border p-10 text-center">
    <p className="font-display text-lg font-light tracking-tight">{title}</p>
    {description && (
      <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{description}</p>
    )}
  </div>
);

export const Loading: React.FC<{ label?: string }> = ({ label = "Loading…" }) => (
  <p className="text-sm text-muted-foreground" role="status">
    {label}
  </p>
);

export const ErrorNote: React.FC<{ message: string }> = ({ message }) => (
  <p role="alert" className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
    {message}
  </p>
);

export const NoProject: React.FC = () => (
  <EmptyState
    title="No project linked to your account yet"
    description="Your Siyakha client portal account is active but no project has been assigned to it. Contact nikita@siyakhatechnology.co.za and we will link your projects."
  />
);
