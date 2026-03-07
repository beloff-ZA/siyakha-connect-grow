import { Server, ShieldCheck, Clock, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const WhySiyakha = () => {
  const painPoints = [
    {
      icon: Clock,
      title: "Tired of Slow IT Response Times?",
      description: "Our dedicated field engineers are dispatched same-day. No ticket queues, no waiting — just boots on the ground when your business needs it most.",
    },
    {
      icon: Server,
      title: "Network Downtime Costing You Money?",
      description: "We design, install, and manage resilient network infrastructure — structured cabling, enterprise Wi-Fi, and failover solutions that keep you online.",
    },
    {
      icon: ShieldCheck,
      title: "Worried About Security Gaps?",
      description: "From CCTV and access control to cybersecurity audits, we close the gaps that leave your business exposed to threats and compliance risks.",
    },
    {
      icon: Users,
      title: "Scaling Without In-House IT Staff?",
      description: "Our smart hands teams act as your on-site IT department — handling rollouts, maintenance, and support across multiple branches in South Africa and throughout Africa.",
    },
    {
      icon: TrendingUp,
      title: "IT Budget Under Pressure?",
      description: "Predictable monthly costs with no hidden fees. Our managed service plans give you enterprise-grade support at a fraction of the cost of hiring internally.",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="accent-line mb-4"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            The IT Challenges Holding Your Business Back
          </h2>
          <p className="text-lg text-muted-foreground">
            Every day without reliable ICT infrastructure costs your business time, money, and opportunities. Here's how we solve that.
          </p>
        </div>

        {/* Pain Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {painPoints.map((item, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl bg-card border border-border transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 group"
              style={{ boxShadow: 'var(--shadow-soft)' }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-soft)')}
            >
              <div className="icon-badge mb-4">
                <item.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-accent transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild className="cta-primary text-lg px-8 py-4 group">
            <Link to="/contact#quote-form">
              Tell Us What You Need
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-accent mb-2">2008</div>
              <div className="text-sm text-muted-foreground">Established</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Project Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent mb-2">48hr</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent mb-2">9/10</div>
              <div className="text-sm text-muted-foreground">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySiyakha;
