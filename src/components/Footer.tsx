import { Facebook, Linkedin, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="text-2xl font-bold">
              Siyakha<span className="text-accent">Tech</span>
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
                <a href="/about" className="text-white/80 hover:text-accent transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className="text-white/80 hover:text-accent transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="/contact" className="text-white/80 hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-white/80 hover:text-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-white/80 hover:text-accent transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              <li>
                <a href="/services/infrastructure-networking" className="text-white/80 hover:text-accent transition-colors">
                  Infrastructure & Networking
                </a>
              </li>
              <li>
                <a href="/services/security-surveillance" className="text-white/80 hover:text-accent transition-colors">
                  Security & Surveillance
                </a>
              </li>
              <li>
                <a href="/services/cloud-edge-solutions" className="text-white/80 hover:text-accent transition-colors">
                  Cloud & Edge Solutions
                </a>
              </li>
              <li>
                <a href="/services/smart-collaboration-tools" className="text-white/80 hover:text-accent transition-colors">
                  Smart Collaboration
                </a>
              </li>
              <li>
                <a href="/support" className="text-white/80 hover:text-accent transition-colors">
                  24/7 Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Get in Touch</h3>
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
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                <div className="text-white/80">
                  21 Foreman Road<br />
                  Spartan, Gauteng<br />
                  South Africa
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
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