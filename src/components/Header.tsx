import { useState } from "react";
import { Menu, X, ChevronDown, Phone, Search } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onOpenWizard?: () => void;
}

const Header = ({ onOpenWizard }: HeaderProps) => {
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
    <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/lovable-uploads/18df369d-304c-4290-97b8-53ae2aad27fb.png"
              alt="Siyakha Technology logo"
              width="199"
              height="51"
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="space-x-6">
              <NavigationMenuItem>
                <Link to="/" className="text-foreground hover:text-accent transition-colors font-medium text-sm">
                  Home
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/about" className="text-foreground hover:text-accent transition-colors font-medium text-sm">
                  About
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground hover:text-accent font-medium bg-transparent text-sm">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-72 p-4 bg-popover rounded-lg border border-border shadow-lg">
                    <Link
                      to="/services"
                      className="block px-4 py-3 text-sm font-semibold text-primary hover:text-accent hover:bg-muted rounded-lg transition-colors"
                    >
                      All Services
                    </Link>
                    <div className="h-px bg-border my-2" />
                    {services.map((service) => (
                      <Link
                        key={service}
                        to={`/services/${service.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                        className="block px-4 py-2.5 text-sm text-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors"
                      >
                        {service}
                      </Link>
                    ))}
                    <div className="h-px bg-border my-2" />
                    <div className="text-xs uppercase tracking-wider text-muted-foreground px-4 py-2">Locations</div>
                    <Link to="/it-company-johannesburg" className="block px-4 py-2 text-sm text-foreground hover:text-accent hover:bg-muted rounded-lg">
                      Johannesburg
                    </Link>
                    <Link to="/it-company-cape-town" className="block px-4 py-2 text-sm text-foreground hover:text-accent hover:bg-muted rounded-lg">
                      Cape Town
                    </Link>
                    <Link to="/it-company-london" className="block px-4 py-2 text-sm text-foreground hover:text-accent hover:bg-muted rounded-lg">
                      London
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/projects" className="text-foreground hover:text-accent transition-colors font-medium text-sm">
                  Projects
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/blog" className="text-foreground hover:text-accent transition-colors font-medium text-sm">
                  Blog
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/contact" className="text-foreground hover:text-accent transition-colors font-medium text-sm">
                  Contact
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side CTAs */}
          <div className="flex items-center gap-3">
            {/* Find My Solution - Desktop */}
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden lg:flex items-center gap-2"
              onClick={onOpenWizard}
            >
              <Search className="w-4 h-4" />
              Find My Solution
            </Button>
            
            {/* Book Consultation - Desktop */}
            <Link to="/contact" className="hidden lg:block">
              <Button size="sm" className="cta-primary">
                <Phone className="w-4 h-4 mr-2" />
                Book Consultation
              </Button>
            </Link>

            {user && (
              <button onClick={signOut} className="hidden lg:block text-sm text-muted-foreground hover:text-accent transition-colors">
                Sign Out
              </button>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:text-accent transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="py-6 space-y-1">
              <Link to="/" className="block px-4 py-3 text-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors font-medium">
                Home
              </Link>
              <Link to="/about" className="block px-4 py-3 text-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors font-medium">
                About
              </Link>
              
              <div className="px-4">
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="flex w-full items-center justify-between py-3 text-foreground font-medium"
                >
                  <span>Services</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isServicesOpen && (
                  <div className="pl-4 pb-2 space-y-1">
                    <Link to="/services" className="block py-2 text-sm font-medium text-foreground hover:text-accent">
                      All Services
                    </Link>
                    {services.map((service) => (
                      <Link
                        key={service}
                        to={`/services/${service.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                        className="block py-2 text-sm text-muted-foreground hover:text-accent"
                      >
                        {service}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <Link to="/projects" className="block px-4 py-3 text-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors font-medium">
                Projects
              </Link>
              <Link to="/blog" className="block px-4 py-3 text-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors font-medium">
                Blog
              </Link>
              <Link to="/contact" className="block px-4 py-3 text-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors font-medium">
                Contact
              </Link>

              {/* Mobile CTAs */}
              <div className="px-4 pt-4 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenWizard?.();
                  }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find My Solution
                </Button>
                <Link to="/contact" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full cta-primary justify-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Book Consultation
                  </Button>
                </Link>
              </div>
              
              {user && (
                <button onClick={signOut} className="block w-full text-left px-4 py-3 text-muted-foreground hover:text-accent transition-colors">
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
