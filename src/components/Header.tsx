import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const services = [
    "Infrastructure & Networking",
    "Security & Surveillance", 
    "Cloud & Edge Solutions",
    "Smart Collaboration Tools"
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-primary">
              Siyakha<span className="text-accent">Tech</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="space-x-8">
              <NavigationMenuItem>
                <a href="/" className="text-foreground hover:text-primary transition-colors font-medium">
                  Home
                </a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a href="/about" className="text-foreground hover:text-primary transition-colors font-medium">
                  About
                </a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground hover:text-primary font-medium">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-64 p-4">
                    {services.map((service) => (
                      <a
                        key={service}
                        href={`/services/${service.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                        className="block px-4 py-2 text-sm text-foreground hover:text-accent hover:bg-muted rounded-md transition-colors"
                      >
                        {service}
                      </a>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a href="/projects" className="text-foreground hover:text-primary transition-colors font-medium">
                  Projects
                </a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a href="/blog" className="text-foreground hover:text-primary transition-colors font-medium">
                  Blog
                </a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a href="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
                  Contact
                </a>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* CTA Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button className="cta-primary hidden sm:inline-flex">
              Request a Quote
            </Button>
            
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
              <a href="/" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Home
              </a>
              <a href="/about" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                About
              </a>
              <div className="px-4">
                <div className="flex items-center justify-between py-2 text-foreground">
                  <span>Services</span>
                  <ChevronDown size={16} />
                </div>
                <div className="pl-4 space-y-2">
                  {services.map((service) => (
                    <a
                      key={service}
                      href={`/services/${service.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                      className="block py-1 text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {service}
                    </a>
                  ))}
                </div>
              </div>
              <a href="/projects" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Projects
              </a>
              <a href="/blog" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Blog
              </a>
              <a href="/contact" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Contact
              </a>
              <div className="px-4 pt-2">
                <Button className="cta-primary w-full">
                  Request a Quote
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;