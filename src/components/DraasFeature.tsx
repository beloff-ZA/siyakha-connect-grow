import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock, Zap, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const DraasFeature = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Recovery",
      description: "Minimize downtime with rapid system restoration"
    },
    {
      icon: Shield,
      title: "Business Continuity",
      description: "Keep your operations running during disasters"
    },
    {
      icon: Clock,
      title: "Optimal RPO & RTO",
      description: "Customized recovery objectives for your needs"
    },
    {
      icon: CheckCircle,
      title: "Flexible Solutions",
      description: "Tailored to fit your specific requirements"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-accent/5">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                🚀 DRaaS Services
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
                Disaster Recovery as a Service
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Recover your business-critical systems in a flash with our flexible Disaster Recovery as a Service (DRaaS). We tailor a solution to meet your needs and provide you with the best possible RPO and RTO.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="inline-flex">
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  Get DRaaS Quote
                </Button>
              </Link>
              <Link to="/contact" className="inline-flex">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <feature.icon className="w-6 h-6 text-accent" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DraasFeature;