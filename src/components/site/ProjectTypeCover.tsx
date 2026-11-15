type ProjectTypeCoverProps = { client: string; subtitle: string };

export default function ProjectTypeCover({ client, subtitle }: ProjectTypeCoverProps) {
  return (
    <div className="w-full h-full bg-foreground text-background flex flex-col justify-between p-6 md:p-8" aria-label={`${client} — ${subtitle}; typographic project cover`}>
      <p className="text-[10px] uppercase tracking-[0.18em] opacity-60">Siyakha Technology Solutions</p>
      <div className="border-t border-background/30 pt-5">
        <p className="font-display text-2xl md:text-3xl font-light leading-tight">{client}</p>
        <p className="mt-3 text-sm opacity-75">{subtitle}</p>
      </div>
      <p className="text-[10px] uppercase tracking-[0.18em] opacity-60">Project cover · Mining</p>
    </div>
  );
}