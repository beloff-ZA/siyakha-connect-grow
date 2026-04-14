import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { CartDrawer } from "@/components/shopify/CartDrawer";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

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

  

  return (
    <header className="bg-background/95 border-b border-border sticky top-0 z-50 backdrop-blur-md shadow-sm">
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
            <NavigationMenuList className="space-x-1">
              {[
                { label: "Home", to: "/" },
                { label: "About", to: "/about" },
              ].map((item) => (
                <NavigationMenuItem key={item.label}>
                  <Link
                    to={item.to}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-muted hover:text-primary transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium text-foreground hover:text-primary px-3 py-2 rounded-md hover:bg-muted transition-all duration-200">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="w-72 p-3 bg-popover rounded-lg border border-border shadow-xl">
                    <Link
                      to="/services"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 rounded-md transition-colors"
                    >
                      All Services
                    </Link>
                    <div className="h-px bg-border my-1.5" />
                    {services.map((service) => (
                      <Link
                        key={service}
                        to={`/services/${service.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                        className="block px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-accent rounded-md transition-colors"
                      >
                        {service}
                      </Link>
                    ))}
                    <div className="h-px bg-border my-1.5" />
                    <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Regions</p>
                    {[
                      { label: "IT Company Johannesburg", to: "/it-company-johannesburg" },
                      { label: "IT Company Cape Town", to: "/it-company-cape-town" },
                      { label: "IT Company London", to: "/it-company-london" },
                      { label: "IT Company EMEA", to: "/it-company-emea" },
                      { label: "IT Company Angola", to: "/it-company-angola" },
                    ].map((region) => (
                      <Link
                        key={region.to}
                        to={region.to}
                        className="block px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-accent rounded-md transition-colors"
                      >
                        {region.label}
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {[
                { label: "Products", to: "/products" },
                { label: "Blog", to: "/blog" },
                { label: "Support Deals", to: "/support-deals" },
                { label: "Property", to: "/property" },
                { label: "Contact", to: "/contact" },
              ].map((item) => (
                <NavigationMenuItem key={item.label}>
                  <Link
                    to={item.to}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-muted hover:text-primary transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Cart + Mobile Menu */}
          <div className="flex items-center gap-2">
            <CartDrawer />
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
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
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
                    <Link to="/services" onClick={() => setIsMenuOpen(false)} className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
                      All Services
                    </Link>
                    {services.map((service) => (
                      <Link
                        key={service}
                        to={`/services/${service.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-1 text-sm text-muted-foreground hover:text-accent transition-colors"
                      >
                        {service}
                      </Link>
                    ))}
                    <div className="pt-2 border-t border-border">
                      <Link to="/it-company-johannesburg" onClick={() => setIsMenuOpen(false)} className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
                        IT Company Johannesburg
                      </Link>
                      <Link to="/it-company-cape-town" onClick={() => setIsMenuOpen(false)} className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
                        IT Company Cape Town
                      </Link>
                      <Link to="/it-company-london" onClick={() => setIsMenuOpen(false)} className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
                        IT Company London
                      </Link>
                      <Link to="/it-company-emea" onClick={() => setIsMenuOpen(false)} className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
                        IT Company EMEA
                      </Link>
                      <Link to="/it-company-angola" onClick={() => setIsMenuOpen(false)} className="block py-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
                        IT Company Angola
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Products
              </Link>
              <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Blog
              </Link>
              <Link to="/support-deals" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Support Deals
              </Link>
              <Link to="/property" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Property
              </Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Contact
              </Link>

            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
