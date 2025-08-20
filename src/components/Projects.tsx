import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin, Wifi, Shield, Camera, Printer, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
const maristProject = "/lovable-uploads/b998daf2-a8ef-498b-adb2-59eca8e135ef.png";
const kfcProject = "/lovable-uploads/1840c802-41fe-4f29-ae89-891da2fe347c.png";
const maristCTProject = "/lovable-uploads/de3c5edc-ea87-4242-bbb0-8782b25a22ec.png";
import officeProject from "@/assets/office-project.jpg";
const pelicanImage = "/lovable-uploads/f345d1c0-6383-4a5c-9188-81c8ae221932.png";
const campusKeyImage = "/lovable-uploads/7c314536-73bf-4ae1-b7e3-ccceee5d640e.png";
const conferenceRoomProject = "/lovable-uploads/e85bfefa-f7c0-413b-ac3e-5c3dc791bacc.png";
const guestWifiProject = "/lovable-uploads/08c32d0c-30d7-4eb1-b8c2-73824f3fd226.png";
const guestWifiPortal = "/lovable-uploads/536b36ad-d93e-4ae6-941a-f55cf5ac1fb9.png";

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
    {
      title: "Guest Wi-Fi Solutions for Hotels & Restaurants",
      location: "Thavhani Mall & Hospitality Venues",
      description: "Professional guest Wi-Fi infrastructure with branded login portals, time-based access control, and seamless user experience for hotels and restaurants.",
      image: guestWifiProject,
      images: [guestWifiProject, guestWifiPortal],
      icon: Wifi,
      features: ["Branded Login Portals", "Time-based Access", "User Management", "Hospitality Integration"],
      link: "/projects/guest-wifi-solutions"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <Card 
              key={index}
              className="overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                {project.images && project.images.length > 1 ? (
                  <div className="grid grid-cols-2 h-full gap-1">
                    {project.images.map((img, imgIndex) => (
                      <img 
                        key={imgIndex}
                        src={img}
                        alt={`${project.title} - Image ${imgIndex + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ))}
                  </div>
                ) : (
                  <img 
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
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

                <Link to={project.link} className="inline-flex">
                  <Button 
                    variant="ghost" 
                    className="text-accent hover:text-accent-hover group/btn p-0 h-auto font-medium"
                  >
                    View Project Details
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All Projects CTA */}
        <div className="text-center mt-12">
          <Link to="/projects" className="inline-flex">
            <Button className="cta-secondary">
              View All Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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