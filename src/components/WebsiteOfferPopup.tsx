import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WebsiteOfferPopup = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = sessionStorage.getItem("website-offer-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setOpen(false);
    sessionStorage.setItem("website-offer-dismissed", "true");
  };

  const handleGetStarted = () => {
    handleDismiss();
    navigate("/website-order");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-background overflow-hidden p-0">
        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-primary to-accent w-full" />

        <div className="p-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" />
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Get a Professional Website
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              For as little as
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold text-primary">R299</span>
            <span className="text-lg text-muted-foreground font-medium">/month</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>No upfront costs · Cancel anytime</span>
          </div>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg gap-2"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Button>

          <button
            onClick={handleDismiss}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebsiteOfferPopup;
