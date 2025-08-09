import { Facebook, Linkedin, Phone, Mail, MapPin, MessageCircle, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="flex items-center">
              <img
                src="/lovable-uploads/18df369d-304c-4290-97b8-53ae2aad27fb.png"
                alt="Siyakha Technology logo"
                width="199"
                height="51"
                className="h-8 w-auto"
                loading="lazy"
                decoding="async"
              />
              <span className="sr-only">Siyakha Technology</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              Your trusted BEE Level 1 ICT partner, delivering innovative technology solutions 
              across South Africa since 2008.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com/siyakhatechnology" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/siyakhatech/" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/company/siyakhatechnology" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-white/80 hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-white/80 hover:text-accent transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/80 hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/80 hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/services/infrastructure-and-networking" className="text-white/80 hover:text-accent transition-colors">
                  Infrastructure & Networking
                </Link>
              </li>
              <li>
                <Link to="/services/security-and-surveillance" className="text-white/80 hover:text-accent transition-colors">
                  Security & Surveillance
                </Link>
              </li>
              <li>
                <Link to="/services/cloud-and-edge-solutions" className="text-white/80 hover:text-accent transition-colors">
                  Cloud & Edge Solutions
                </Link>
              </li>
              <li>
                <Link to="/services/smart-collaboration-tools" className="text-white/80 hover:text-accent transition-colors">
                  Smart Collaboration
                </Link>
              </li>
              <li>
                <Link to="/services/national-field-support" className="text-white/80 hover:text-accent transition-colors">
                  National Field Support
                </Link>
              </li>
              <li>
                <Link to="/support-deals" className="text-white/80 hover:text-accent transition-colors">
                  24/7 Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Service Areas</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/it-company-johannesburg" className="text-white/80 hover:text-accent transition-colors">
                  IT Company Johannesburg
                </Link>
              </li>
              <li>
                <Link to="/it-company-cape-town" className="text-white/80 hover:text-accent transition-colors">
                  IT Company Cape Town
                </Link>
              </li>
              <li>
                <Link to="/it-company-london" className="text-white/80 hover:text-accent transition-colors">
                  IT Company London
                </Link>
              </li>
              <li>
                <Link to="/it-company-emea" className="text-white/80 hover:text-accent transition-colors">
                  IT Company EMEA
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6">Get in Touch</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <a href="tel:+27815012993" className="text-white/80 hover:text-accent transition-colors">
                      081 501 2993
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <a href="mailto:info@siyakhatechnology.co.za" className="text-white/80 hover:text-accent transition-colors">
                      info@siyakhatechnology.co.za
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <a
                      href="https://wa.me/27815012993?text=Hi%20Siyakha%20Technology%2C%20I%27d%20like%20to%20chat%20about%20services."
                      className="text-white/80 hover:text-accent transition-colors"
                      aria-label="Chat with us on WhatsApp"
                    >
                      WhatsApp: +27 81 501 2993
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div className="text-white/80">
                    2nd Floor, Nelson Mandela Square<br />
                    Maude Street West Tower, Sandton<br />
                    2146, South Africa
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium mb-2">Business Hours</h4>
                  <div className="text-sm text-white/80 space-y-1">
                    <div className="flex justify-between">
                      <span>Mon - Fri:</span>
                      <span>8:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>9:00 AM - 1:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency:</span>
                      <span className="text-accent">24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white/60 text-sm">
              © {currentYear} Siyakha Technology. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-white/60">
              <span className="bg-accent/20 text-accent px-3 py-1 rounded-full font-medium">
                BEE Level 1 Certified
              </span>
              <span>Reg: 2008/123456/07</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;