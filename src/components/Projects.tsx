import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Wifi, Shield, Camera, Printer, Monitor } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const maristProject = "/lovable-uploads/b998daf2-a8ef-498b-adb2-59eca8e135ef.png";
const kfcProject = "/lovable-uploads/1840c802-41fe-4f29-ae89-891da2fe347c.png";
const maristCTProject = "/lovable-uploads/de3c5edc-ea87-4242-bbb0-8782b25a22ec.png";
import officeProject from "@/assets/office-project.jpg";
const pelicanImage = "/lovable-uploads/f345d1c0-6383-4a5c-9188-81c8ae221932.png";
const campusKeyImage = "/lovable-uploads/7c314536-73bf-4ae1-b7e3-ccceee5d640e.png";
const conferenceRoomProject = "/lovable-uploads/e85bfefa-f7c0-413b-ac3e-5c3dc791bacc.png";

const Projects = () => {
  const location = useLocation();
  
  const projects = [
    {
      title: "Marist Brothers Linmeyer",
      location: "Johannesburg, Gauteng",
      description: "Full Wi-Fi and data infrastructure for 22 classrooms",
      image: maristProject,
      icon: Wifi,
      link: "/projects/marist-brothers-linmeyer"
    },
    {
      title: "Corporate Office Complex",
      location: "Sandton, Gauteng", 
      description: "Comprehensive security and access control system",
      image: officeProject,
      icon: Shield,
      link: "/projects/corporate-office-complex"
    },
    {
      title: "KFC – National Network Rollout",
      location: "Nationwide, South Africa",
      description: "Nationwide Wi‑Fi and secure network for 50+ stores",
      image: kfcProject,
      icon: Wifi,
      link: "/projects/kfc-national-network-rollout"
    },
    {
      title: "The Village Bakery – CCTV",
      location: "Fordsburg, Johannesburg",
      description: "Complete property and in-store CCTV surveillance",
      image: "/lovable-uploads/134e1b88-479c-4122-9897-1e74ae8819a9.png",
      icon: Camera,
      link: "/projects/village-bakery-cctv"
    },
    {
      title: "St Joseph's Marist College",
      location: "Cape Town, Western Cape",
      description: "55-camera fibre network with remote monitoring",
      image: maristCTProject,
      icon: Camera,
      link: "/projects/st-josephs-marist-cape-town-cctv"
    },
    {
      title: "CampusKey – National Overhaul",
      location: "Cape Town • Stellenbosch • PE • Pretoria",
      description: "Multi-campus Cat6 cabling and 500+ AP deployment",
      image: campusKeyImage,
      icon: Wifi,
      link: "/projects/campuskey-network-overhaul"
    },
  ];

  const stats = [
    { value: "500+", label: "Access Points" },
    { value: "1000+", label: "CCTV Cameras" },
    { value: "50+", label: "Cloud Migrations" },
    { value: "99.9%", label: "Network Uptime" }
  ];

  return (
    <section className="py-24 lg:py-32 bg-secondary">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="divider-bold mb-6" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 tracking-tight leading-[1.1]">
            Featured Projects
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Discover how we've transformed businesses with innovative technology solutions.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {projects.map((project, index) => (
            <Link 
              key={index}
              to={project.link}
              className="group relative overflow-hidden rounded-xl aspect-[4/3]"
            >
              <img 
                src={project.image}
                alt={project.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  {project.location}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <p className="text-white/80 text-sm">
                  {project.description}
                </p>
              </div>

              <div className="absolute top-4 right-4">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <project.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        {location.pathname !== '/projects' && (
          <div className="text-center mb-20">
            <Button asChild variant="outline" size="lg" className="font-semibold group">
              <Link to="/projects">
                View All Projects
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border">
          {stats.map((stat, index) => (
            <div key={index} className="stat-block">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
