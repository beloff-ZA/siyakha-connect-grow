import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const projects = [
  {
    title: "Marist Brothers Linmeyer",
    category: "Education",
    image: "/lovable-uploads/4ce3794c-caeb-4109-b893-cf137d3054d1.png",
    problem: "Outdated network infrastructure causing frequent outages",
    solution: "Complete network overhaul with enterprise-grade equipment",
    result: "99.9% uptime achieved, serving 800+ students daily",
    link: "/projects/marist-brothers-linmeyer",
  },
  {
    title: "KFC National Rollout",
    category: "Retail / Multi-site",
    image: "/lovable-uploads/e34b216a-0325-45dd-996f-b6b727e542ee.png",
    problem: "Inconsistent connectivity across 50+ franchise locations",
    solution: "Standardized network infrastructure and VoIP deployment",
    result: "Unified communications across all sites nationwide",
    link: "/projects/kfc-national-network-rollout",
  },
  {
    title: "Village Bakery CCTV",
    category: "Industrial",
    image: "/lovable-uploads/dfdcf468-60c2-4f7c-8f51-8ac52f9789ae.png",
    problem: "Security blind spots in large production facility",
    solution: "Comprehensive HD surveillance system with remote access",
    result: "24/7 monitoring with 100% coverage of critical areas",
    link: "/projects/village-bakery-cctv",
  },
];

const FeaturedProjects = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Proven Results
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Featured Case Studies
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how we've helped organizations like yours solve their technology challenges.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl overflow-hidden border border-border hover:border-accent/50 hover:shadow-xl transition-all group"
            >
              {/* Image */}
              <div className="relative h-48 bg-muted overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {project.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 group-hover:text-accent transition-colors">
                  {project.title}
                </h3>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Problem</p>
                    <p className="text-sm">{project.problem}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Solution</p>
                    <p className="text-sm">{project.solution}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-accent">{project.result}</p>
                  </div>
                </div>

                <Link to={project.link}>
                  <Button variant="outline" className="w-full group/btn">
                    View Case Study
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/projects">
            <Button className="cta-secondary">
              View All Projects
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
