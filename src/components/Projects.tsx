import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin, Wifi, Shield } from "lucide-react";
import schoolProject from "@/assets/school-project.jpg";
import officeProject from "@/assets/office-project.jpg";

const Projects = () => {
  const projects = [
    {
      title: "Marist Brothers Linmeyer",
      location: "Johannesburg, Gauteng",
      description: "Full Wi-Fi and data infrastructure for 22 classrooms",
      image: schoolProject,
      icon: Wifi,
      features: ["Enterprise Wi-Fi 6", "Structured Cabling", "Network Security", "24/7 Monitoring"],
      link: "/projects/marist-brothers-linmeyer"
    },
    {
      title: "Corporate Office Complex",
      location: "Sandton, Gauteng", 
      description: "Comprehensive security and access control system",
      image: officeProject,
      icon: Shield,
      features: ["IP CCTV System", "Access Control", "Intercom Network", "Smart Gate Automation"],
      link: "/projects/corporate-office-complex"
    }
  ];

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Featured Project Spotlight
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how we've transformed businesses with innovative technology solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <Card 
              key={index}
              className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => window.location.href = project.link}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-primary/60 group-hover:bg-primary/40 transition-colors duration-300"></div>
                <div className="absolute top-4 left-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <project.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {project.location}
                </div>
                
                <h3 className="text-xl font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-muted-foreground mb-4">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.features.map((feature, featureIndex) => (
                    <span 
                      key={featureIndex}
                      className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <Button 
                  variant="ghost" 
                  className="text-accent hover:text-accent-hover group/btn p-0 h-auto font-medium"
                >
                  View Project Details
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All Projects CTA */}
        <div className="text-center mt-12">
          <Button className="cta-secondary">
            View All Projects
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Project Stats */}
        <div className="mt-16 pt-16 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-accent mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Wi-Fi Access Points Installed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-2">1000+</div>
            <div className="text-sm text-muted-foreground">CCTV Cameras Deployed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-2">50+</div>
            <div className="text-sm text-muted-foreground">Cloud Migrations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">Network Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;