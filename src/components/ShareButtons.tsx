import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Instagram, Copy, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  title?: string;
  url?: string;
  className?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url, className }) => {
  const { toast } = useToast();

  const { shareTitle, shareUrl, shareText } = useMemo(() => {
    const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const t = title || (typeof document !== "undefined" ? document.title : "Check this out");
    return {
      shareTitle: t,
      shareUrl: currentUrl,
      shareText: `${t} — ${currentUrl}`,
    };
  }, [title, url]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareTitle, url: shareUrl });
      } catch (e) {
        // user cancelled or error
      }
    } else {
      await handleCopy();
    }
  };

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

  const handleInstagram = async () => {
    // No official Instagram web share API. Best UX: copy link then open Instagram.
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {}
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    toast({ title: "Link copied for Instagram", description: "Paste into your Story, DM, or bio." });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button variant="secondary" onClick={handleNativeShare} aria-label="Share">
        <Share2 className="mr-1" /> Share
      </Button>
      <Button variant="outline" onClick={handleWhatsApp} aria-label="Share on WhatsApp">
        <MessageCircle className="mr-1" /> WhatsApp
      </Button>
      <Button variant="outline" onClick={handleInstagram} aria-label="Share on Instagram">
        <Instagram className="mr-1" /> Instagram
      </Button>
      <Button variant="ghost" onClick={handleCopy} aria-label="Copy link">
        <Copy className="mr-1" /> Copy link
      </Button>
    </div>
  );
};

export default ShareButtons;
