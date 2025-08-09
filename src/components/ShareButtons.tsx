import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  title?: string;
  url?: string;
  className?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url, className }) => {
  const { toast } = useToast();

  const { shareUrl, shareText } = useMemo(() => {
    const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const t = title || (typeof document !== "undefined" ? document.title : "Check this out");
    return {
      shareUrl: currentUrl,
      shareText: `${t} — ${currentUrl}`,
    };
  }, [title, url]);

  // native share removed as requested

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: "The article link is ready to paste anywhere." });
    } catch {
      toast({ title: "Copy failed", description: "Please copy the URL manually.", variant: "destructive" as any });
    }
  };

  const handleWhatsApp = () => {
    const wa = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  // Instagram share removed as requested

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button variant="outline" onClick={handleWhatsApp} aria-label="Share on WhatsApp">
        <MessageCircle className="mr-1" /> WhatsApp
      </Button>
      <Button variant="ghost" onClick={handleCopy} aria-label="Copy link">
        <Copy className="mr-1" /> Copy link
      </Button>
    </div>
  );
};

export default ShareButtons;
