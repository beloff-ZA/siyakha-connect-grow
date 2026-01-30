import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin, Wifi, Shield, Camera, Printer, Monitor, Activity, Radio, Server, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const maristProject = "/lovable-uploads/b998daf2-a8ef-498b-adb2-59eca8e135ef.png";
const kfcProject = "/lovable-uploads/1840c802-41fe-4f29-ae89-891da2fe347c.png";
const maristCTProject = "/lovable-uploads/de3c5edc-ea87-4242-bbb0-8782b25a22ec.png";
import officeProject from "@/assets/office-project.jpg";
const pelicanImage = "/lovable-uploads/f345d1c0-6383-4a5c-9188-81c8ae221932.png";
const campusKeyImage = "/lovable-uploads/7c314536-73bf-4ae1-b7e3-ccceee5d640e.png";
const conferenceRoomProject = "/lovable-uploads/e85bfefa-f7c0-413b-ac3e-5c3dc791bacc.png";

const Projects = () => {
  const projects = [
    {
      title: "Marist Brothers Linmeyer",
      location: "Johannesburg, Gauteng",
      description: "Full Wi-Fi and data infrastructure for 22 classrooms",
      image: maristProject,
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
    },
    {
      title: "KFC – National Network Infrastructure Rollout",
      location: "Nationwide, South Africa",
      description: "In partnership with Exmile: nationwide Wi‑Fi and secure network deployment for KFC stores",
      image: kfcProject,
      icon: Wifi,
      features: ["Nationwide rollout", "50+ firewalls", "1000+ devices & APs", "Enterprise compliance"],
      link: "/projects/kfc-national-network-rollout"
    },
    {
      title: "The Village Bakery – CCTV Installation",
      location: "Fordsburg, Johannesburg",
      description: "Complete property and in-store CCTV surveillance system for comprehensive security coverage",
      image: "/lovable-uploads/134e1b88-479c-4122-9897-1e74ae8819a9.png",
      icon: Camera,
      features: ["Property-wide coverage", "In-store monitoring", "High-definition cameras", "24/7 recording"],
      link: "/projects/village-bakery-cctv"
    },
    {
      title: "Greestone – Network Infrastructure Rebuild",
      location: "Johannesburg, Gauteng",
      description: "Complete network overhaul with Linux server installation, upgraded network points, and new switching infrastructure",
      image: "/lovable-uploads/c8302aaa-3768-46a7-93ab-e0b5021f6d5c.png",
      icon: Wifi,
      features: ["Linux server setup", "Network point upgrades", "New switch cabinet", "Ongoing support"],
      link: "/projects/greestone-network-rebuild"
    },
    {
      title: "St Joseph's Marist College – Campus CCTV Overhaul",
      location: "Cape Town, Western Cape",
      description: "55‑camera fibre network covering the entire campus with remote monitoring",
      image: maristCTProject,
      icon: Camera,
      features: ["55 cameras", "Fibre backbone", "Full campus coverage", "Remote monitoring"],
      link: "/projects/st-josephs-marist-cape-town-cctv"
    },
    {
      title: "The Pelican Club Bahrain – International Remote IT Support",
      location: "Manama, Bahrain",
      description: "Remote printer setup, troubleshooting, and desktop support ensuring uninterrupted operations.",
      image: pelicanImage,
      icon: Printer,
      features: ["Remote printer fixes", "Driver & network setup", "Remote desktop support", "Optimized workflows"],
      link: "/projects/pelican-club-bahrain"
    },
    {
      title: "CampusKey – National Network Infrastructure Overhaul",
      location: "Cape Town • Stellenbosch • PE • Pretoria (+ remote Bloemfontein)",
      description: "Multi-campus Cat6 cabling, fibre backbone, and 500+ AP deployment for high-speed student Wi‑Fi.",
      image: campusKeyImage,
      icon: Wifi,
      features: ["500+ APs", "Fibre backbone", "Cat6 cabling", "Centralized management"],
      link: "/projects/campuskey-network-overhaul"
    },
    {
      title: "Executive Conference Room Setup",
      location: "Johannesburg, Gauteng",
      description: "Premium boardroom transformation with integrated AV systems, smart displays, and collaborative technology solutions.",
      image: conferenceRoomProject,
      icon: Monitor,
      features: ["Smart Display Integration", "AV System Setup", "Collaborative Tools", "Premium Fitout"],
      link: "/projects/executive-conference-room"
    },
  ];

  const stats = [
    { value: "500+", label: "Wi-Fi Access Points Installed", icon: Radio },
    { value: "1000+", label: "CCTV Cameras Deployed", icon: Eye },
    { value: "50+", label: "Cloud Migrations", icon: Server },
    { value: "99.9%", label: "Network Uptime", icon: Activity },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="accent-line mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Featured Project Spotlight
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how we've transformed businesses with innovative technology solutions.
          </p>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            <Card 
              key={index}
              className="project-card group relative overflow-hidden border-0"
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500" />
                
                {/* Icon Badge */}
                <div className="absolute top-4 left-4">
                  <div className="icon-badge">
                    <project.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Title on Image */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center text-xs text-white/80 mb-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {project.location}
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {project.title}
                  </h3>
                </div>
              </div>
              
              {/* Card Content */}
              <CardContent className="p-5">
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.features.slice(0, 3).map((feature, featureIndex) => (
                    <span 
                      key={featureIndex}
                      className="feature-tag"
                    >
                      {feature}
                    </span>
                  ))}
                  {project.features.length > 3 && (
                    <span className="feature-tag">
                      +{project.features.length - 3}
                    </span>
                  )}
                </div>

                {/* CTA Link */}
                <Link to={project.link} className="inline-flex">
                  <Button 
                    variant="ghost" 
                    className="text-accent hover:text-accent-hover hover:bg-accent/5 group/btn p-0 h-auto font-semibold"
                  >
                    View Project Details
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          ))}
        </div>

        {/* All Projects CTA - Only show when not on projects page */}
        {window.location.pathname !== '/projects' && (
          <div className="text-center mt-12">
            <Link to="/projects" className="inline-flex">
              <Button className="cta-orange">
                View All Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Project Stats - Glass Effect Cards */}
        <div className="mt-20 pt-12 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="stats-card group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-accent mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
