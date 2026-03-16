import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import websiteOfferImg from "@/assets/website-offer-popup.png";

const WebsiteOfferPopup = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = sessionStorage.getItem("website-offer-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 1500);
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
      <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-2xl overflow-hidden rounded-2xl">
        <img
          src={websiteOfferImg}
          alt="Complete client websites from only R199 per month"
          className="w-full cursor-pointer rounded-t-2xl"
          onClick={handleGetStarted}
        />
        <div className="bg-background p-4 flex flex-col gap-2 rounded-b-2xl">
          <Button onClick={handleGetStarted} size="lg" className="w-full font-semibold text-lg gap-2">
            Get Started <ArrowRight className="w-5 h-5" />
          </Button>
          <button onClick={handleDismiss} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-1">
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebsiteOfferPopup;
