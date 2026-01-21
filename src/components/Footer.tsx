import { Facebook, Linkedin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { label: "About Us", to: "/about" },
    { label: "Careers", to: "/careers" },
    { label: "Contact Us", to: "/contact" },
    { label: "Log It", to: "/log-it" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" }
  ];

  const serviceLinks = [
    { label: "Infrastructure & Networking", to: "/services/infrastructure-and-networking" },
    { label: "Security & Surveillance", to: "/services/security-and-surveillance" },
    { label: "Cloud & Edge Solutions", to: "/services/cloud-and-edge-solutions" },
    { label: "Smart Collaboration", to: "/services/smart-collaboration-tools" },
    { label: "National Field Support", to: "/services/national-field-support" },
    { label: "24/7 Support", to: "/support-deals" }
  ];

  const areaLinks = [
    { label: "Johannesburg", to: "/it-company-johannesburg" },
    { label: "Cape Town", to: "/it-company-cape-town" },
    { label: "London", to: "/it-company-london" },
    { label: "EMEA", to: "/it-company-emea" },
    { label: "Angola", to: "/it-company-angola" }
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main Footer */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <img
              src="/lovable-uploads/18df369d-304c-4290-97b8-53ae2aad27fb.png"
              alt="Siyakha Technology logo"
              width="199"
              height="51"
              className="h-10 w-auto mb-6"
              loading="lazy"
            />
            <p className="text-white/60 leading-relaxed mb-8">
              Your trusted BEE Level 1 ICT partner, delivering innovative technology solutions across South Africa since 2008.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com/siyakhatechnology" 
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/siyakhatech/" 
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/company/siyakhatechnology" 
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-white/80">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-white/80">Services</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-white/80">Service Areas</h3>
            <ul className="space-y-3">
              {areaLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/40 text-sm">
              © {currentYear} Siyakha Technology. All rights reserved.
            </div>
            <div className="px-4 py-2 bg-accent/20 text-accent text-sm font-semibold rounded-full">
              BEE Level 1 Certified
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
