import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName =
    ((user?.user_metadata as any)?.full_name as string) ||
    (user?.email ? user.email.split("@")[0] : "Account");
  const avatarUrl = ((user?.user_metadata as any)?.avatar_url as string) || null;
  const initials = (displayName || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const services = [
    "Infrastructure & Networking",
    "Security & Surveillance", 
    "Cloud & Edge Solutions",
    "Smart Collaboration Tools",
    "National Field Support",
    "Healthcare IT Support"
  ];

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
                <NavigationMenuContent>
                  <div className="w-64 p-4">
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
                <Link to="/need-help" className="text-foreground hover:text-primary transition-colors font-medium">
                  Need Help
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
            <Link to="/contact" className="hidden sm:inline-flex">
              <Button className="cta-primary">Request a Quote</Button>
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="hidden sm:inline-flex">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={`${displayName} avatar`} />
                      ) : (
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{displayName}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => { try { await signOut(); } finally { window.location.href = "/"; } }} className="text-destructive">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="hidden sm:inline-flex">
                <Button variant="secondary">Sign in</Button>
              </Link>
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
              <Link to="/need-help" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Need Help
              </Link>
              <Link to="/contact" className="block px-4 py-2 text-foreground hover:text-primary transition-colors">
                Contact
              </Link>
<div className="px-4 pt-2">
                <Link to="/contact" className="block w-full">
                  <Button className="cta-primary w-full">Request a Quote</Button>
                </Link>
                <div className="h-2" />
                {user ? (
                  <>
                    <Link to="/dashboard" className="block w-full">
                      <Button variant="secondary" className="w-full">Dashboard</Button>
                    </Link>
                    <div className="h-2" />
                    <Button variant="ghost" className="w-full" onClick={async () => { try { await signOut(); } finally { window.location.href = "/"; } }}>Sign out</Button>
                  </>
                ) : (
                  <Link to="/auth" className="block w-full">
                    <Button variant="secondary" className="w-full">Sign in</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;