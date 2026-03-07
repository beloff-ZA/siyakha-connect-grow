import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const adobeApps = [
  { name: "Photoshop", abbr: "Ps", bg: "bg-[hsl(210,80%,25%)]" },
  { name: "Illustrator", abbr: "Ai", bg: "bg-[hsl(30,70%,25%)]" },
  { name: "InDesign", abbr: "Id", bg: "bg-[hsl(340,60%,30%)]" },
  { name: "Premiere Pro", abbr: "Pr", bg: "bg-[hsl(270,50%,25%)]" },
  { name: "After Effects", abbr: "Ae", bg: "bg-[hsl(270,60%,30%)]" },
  { name: "Lightroom", abbr: "Lr", bg: "bg-[hsl(200,70%,30%)]" },
  { name: "Adobe Express", abbr: "Ex", bg: "bg-[hsl(0,0%,15%)]" },
  { name: "Acrobat Pro", abbr: "Ac", bg: "bg-[hsl(0,70%,40%)]" },
  { name: "Dreamweaver", abbr: "Dw", bg: "bg-[hsl(140,50%,25%)]" },
  { name: "Animate", abbr: "An", bg: "bg-[hsl(15,60%,25%)]" },
  { name: "Fresco", abbr: "Fr", bg: "bg-[hsl(160,50%,25%)]" },
  { name: "Audition", abbr: "Au", bg: "bg-[hsl(150,60%,25%)]" },
];

const AdobePartner = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background border-y border-border">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-accent border-accent/30 bg-accent/5">
            <GraduationCap className="w-4 h-4 mr-2" />
            Education Partner
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            Your Trusted{" "}
            <span className="text-accent">Adobe Education Partner</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Empowering education through world-class creative technology. We supply, license, and support the full Adobe Creative Cloud suite for schools, universities, and training institutions.
          </p>

          {/* App Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-6 mb-12">
            {adobeApps.map((app) => (
              <div key={app.name} className="flex flex-col items-center gap-2 group">
                <div
                  className={`${app.bg} w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md transition-transform duration-200 group-hover:scale-110`}
                >
                  {app.abbr}
                </div>
                <span className="text-xs md:text-sm text-muted-foreground font-medium">
                  {app.name}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="cta-primary group">
              <Link to="/contact#quote-form">
                Get Adobe Licensing Quote
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdobePartner;
