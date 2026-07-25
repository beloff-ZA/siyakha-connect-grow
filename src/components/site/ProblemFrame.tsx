const ProblemFrame = () => (
  <section className="bg-background border-b border-foreground/10">
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6">
          The problem
        </p>
        <p className="font-display font-light text-2xl md:text-4xl leading-[1.2] tracking-[-0.015em] text-foreground">
          Sites are juggling three or more vendors for security, connectivity and operations —
          <span className="italic text-foreground/60"> with no single accountable partner </span>
          when a camera goes dark, a link drops, or an alarm fires at 2am.
        </p>
      </div>
    </div>
  </section>
);

export default ProblemFrame;