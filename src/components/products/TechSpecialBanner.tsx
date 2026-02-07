import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Zap, Network, Server, Shield, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const TechSpecialBanner = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show popup after 2 seconds if not dismissed this session
    const hasSeenPopup = sessionStorage.getItem("tech-special-popup-seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("tech-special-popup-seen", "true");
  };

  const handleDismissBanner = () => {
    setDismissed(true);
  };

  return (
    <>
      {/* Sticky Banner */}
      {!dismissed && (
        <div className="bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground py-3 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <span className="font-bold text-sm sm:text-base">🔥 Technology Special Running!</span>
            </div>
            <span className="text-sm opacity-90 hidden md:inline">|</span>
            <button 
              onClick={() => setShowPopup(true)}
              className="text-sm sm:text-base font-medium underline underline-offset-2 hover:text-accent transition-colors cursor-pointer"
            >
              Network Clean L3 Switch Special → View Deal
            </button>
            <button 
              onClick={handleDismissBanner}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Special Offer Popup */}
      <Dialog open={showPopup} onOpenChange={handleClosePopup}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-accent/50">
          <div className="bg-gradient-to-br from-primary via-primary/95 to-accent p-6 text-primary-foreground">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-accent text-accent-foreground animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Limited Time
                </Badge>
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-primary-foreground">
                Network Clean L3 Switch Special
              </DialogTitle>
            </DialogHeader>
            <p className="mt-2 text-primary-foreground/90">
              Enterprise-grade Layer 3 switching at an unbeatable price!
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Product Highlight */}
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-secondary/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <img 
                  src="/lovable-uploads/gwn7816p-angle1.png" 
                  alt="Grandstream GWN7816P L3 Switch"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Grandstream GWN7816P</h3>
                <p className="text-sm text-muted-foreground mb-2">48-Port L3 Managed PoE++ Switch</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-accent">R15,499</span>
                  <span className="text-sm text-muted-foreground line-through">R18,999</span>
                  <Badge variant="secondary" className="bg-accent/10 text-accent">Save 18%</Badge>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-accent/10 rounded-full">
                  <Network className="w-4 h-4 text-accent" />
                </div>
                <span>48 GbE + 6 SFP+</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-accent/10 rounded-full">
                  <Zap className="w-4 h-4 text-accent" />
                </div>
                <span>900W PoE++ Budget</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-accent/10 rounded-full">
                  <Server className="w-4 h-4 text-accent" />
                </div>
                <span>Layer 3 Routing</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-accent/10 rounded-full">
                  <Shield className="w-4 h-4 text-accent" />
                </div>
                <span>3 Year Warranty</span>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Why Siyakha?</span> Unlike conventional stores, we supply, install, configure and provide ongoing support. Get a complete network solution, not just hardware.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/contact#quote-form" className="flex-1" onClick={handleClosePopup}>
                <Button className="w-full cta-primary gap-2">
                  Get Special Quote
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  handleClosePopup();
                  // Scroll to the product on page
                  setTimeout(() => {
                    const productElement = document.querySelector('[data-product-id="gs-gwn7816p"]');
                    if (productElement) {
                      productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                }}
              >
                View Product Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TechSpecialBanner;
