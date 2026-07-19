import { useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  url: string;
  text?: string;
  variant?: "icon" | "default";
}

const ShareButton = ({ title, url, text, variant = "icon" }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  const shareText = text || `Check out ${title} from Siyakha Technology`;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        return;
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share failed", err);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard failed", err);
    }
  };

  if (variant === "default") {
    return (
      <Button
        onClick={handleClick}
        variant="outline"
        className="rounded-none border-border hover:border-foreground text-[11px] uppercase tracking-[0.24em] h-12 px-6"
      >
        {copied ? <Check className="w-3.5 h-3.5 mr-2" /> : <Share2 className="w-3.5 h-3.5 mr-2" />}
        {copied ? "Link copied" : "Share product"}
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      title="Share product"
      className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Share product"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </button>
  );
};

export default ShareButton;
