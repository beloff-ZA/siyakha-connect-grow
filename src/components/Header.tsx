import { useState } from "react";

import { Menu, X, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const services = [
    "Infrastructure & Networking",
    "Security & Surveillance", 
    "Cloud & Edge Solutions",
    "Smart Collaboration Tools",
    "National Field Support",
    "Healthcare IT Support"
  ];

  const { user, signOut } = useAuth();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" aria-label="Siyakha Technology home" className="flex items-center">
              <img
                src="/lovable-uploads/18df369d-304c-4290-97b8-53ae2aad27fb.png"
                alt="Siyakha Technology logo"
                width="199"
                height="51"
                className="h-8 w-auto md:h-9"
                decoding="async"
              />
              <span className="sr-only">Siyakha Technology</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="space-x-8">
              <NavigationMenuItem>
                <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
                  Home
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
                  About
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground hover:text-primary font-medium">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="w-64 p-4 bg-popover rounded-md border border-border shadow-lg">
                    <Link
                      to="/services"
                      className="block px-4 py-2 mb-2 text-sm font-medium text-primary hover:text-accent hover:bg-muted rounded-md transition-colors"
                    >
                      All Services
                    </Link>
                    {services.map((service) => (
                      <Link
                        key={service}
                        to={`/services/${service.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                        className="block px-4 py-2 text-sm text-foreground hover:text-accent hover:bg-muted rounded-md transition-colors"
                      >
                        {service}
                      </Link>
                    ))}
<div className="mt-3 border-t border-border pt-3">
  <Link
    to="/it-company-johannesburg"
    className="block px-4 py-2 text-sm font-medium text-foreground hover:text-accent hover:bg-muted rounded-md transition-colors"
  >
    IT Company Johannesburg
  </Link>
  <Link
    to="/it-company-cape-town"
    className="block px-4 py-2 text-sm font-medium text-foreground hover:text-accent hover:bg-muted rounded-md transition-colors"
  >
    IT Company Cape Town
  </Link>
  <Link
    to="/it-company-london"
    className="block px-4 py-2 text-sm font-medium text-foreground hover:text-accent hover:bg-muted rounded-md transition-colors"
  >
    IT Company London
  </Link>
  <Link
    to="/it-company-emea"
    className="block px-4 py-2 text-sm font-medium text-foreground hover:text-accent hover:bg-muted rounded-md transition-colors"
  >
    IT Company EMEA
  </Link>
  <Link
    to="/it-company-angola"
    className="block px-4 py-2 text-sm font-medium text-foreground hover:text-accent hover:bg-muted rounded-md transition-colors"
  >
    IT Company Angola
  </Link>
</div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/projects" className="text-foreground hover:text-primary transition-colors font-medium">
                  Projects
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/blog" className="text-foreground hover:text-primary transition-colors font-medium">
                  Blog
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/support-deals" className="text-foreground hover:text-primary transition-colors font-medium">
                  Support Deals
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
                  Contact
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* CTA Button & Mobile Menu */}
<div className="flex items-center space-x-4">
            {user && (
              <button onClick={signOut} className="hidden lg:inline text-sm text-foreground hover:text-primary transition-colors">Sign Out</button>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:text-primary"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="py-4 space-y-4">
              <Link to="/" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/about" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                About
              </Link>
              <div className="px-4">
                <button
                  type="button"
                  onClick={() => setIsServicesOpen((o) => !o)}
                  className="flex w-full items-center justify-between py-2 text-foreground"
                  aria-expanded={isServicesOpen}
                  aria-controls="mobile-services-submenu"
                >
                  <span>{isServicesOpen ? "Hide Services" : "Show Services"}</span>
                  <ChevronDown size={16} className={`transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
                </button>
                {isServicesOpen && (
                  <div id="mobile-services-submenu" className="pl-4 space-y-2">
                      <Link to="/services" className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
                        All Services
                      </Link>
                      {services.map((service) => (
                        <Link
                          key={service}
                          to={`/services/${service.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                          className="block py-1 text-sm text-muted-foreground hover:text-accent transition-colors"
                        >
                          {service}
                        </Link>
                      ))}
<div className="pt-2 border-t border-border">
  <Link to="/it-company-johannesburg" className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
    IT Company Johannesburg
  </Link>
  <Link to="/it-company-cape-town" className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
    IT Company Cape Town
  </Link>
  <Link to="/it-company-london" className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
    IT Company London
  </Link>
  <Link to="/it-company-emea" className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
    IT Company EMEA
  </Link>
  <Link to="/it-company-angola" className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
    IT Company Angola
  </Link>
</div>
                  </div>
                )}
              </div>
              <Link to="/projects" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Projects
              </Link>
              <Link to="/blog" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Blog
              </Link>
              <Link to="/support-deals" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Support Deals
              </Link>
              <Link to="/contact" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              {user && (
                <button onClick={signOut} className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;