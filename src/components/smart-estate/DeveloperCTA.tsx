import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import PartnerFormDialog from "./PartnerFormDialog";

const DeveloperCTA = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="overline mb-6">For Developers, Owners & Operators</p>
          <h2 className="font-display font-light text-4xl md:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.025em] text-foreground">
            Building something
            <span className="italic text-accent"> remarkable?</span>
            <br />
            Let's engineer the intelligence inside it.
          </h2>

          <p className="mt-10 max-w-xl mx-auto text-muted-foreground text-base md:text-lg leading-relaxed">
            Bring us in at concept stage and we'll deliver a building that
            performs from the day the keys are handed over.
          </p>

          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <PartnerFormDialog
              defaultSubject="Start a Conversation"
              title="Start a Conversation"
              subtitle="Bring us in at concept stage. Share your project and we'll respond within one business day."
              trigger={
                <Button className="cta-primary">
                  Start a Conversation <ArrowUpRight className="h-4 w-4" />
                </Button>
              }
            />
            <Button asChild variant="ghost" className="cta-secondary">
              <a href="https://wa.me/27815012993?text=Hi%20Siyakha%20Interlink%2C%20I%27d%20like%20to%20discuss%20a%20development%20project." target="_blank" rel="noopener noreferrer">
                WhatsApp the Team
              </a>
            </Button>
          </div>

          <div className="mt-20 hairline" />
          <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Siyakha Tech Solutions · Johannesburg · Cape Town · Durban · Pretoria · Dubai · Abu Dhabi · Fujairah · Riyadh · Doha · London · EMEA
          </p>
        </div>
      </div>
    </section>
  );
};

export default DeveloperCTA;
