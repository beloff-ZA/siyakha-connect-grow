import { useState } from "react";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";
import type { CaseStudy } from "@/content/caseStudies";
import { caseStudyShareText, caseStudyShareUrl, caseStudyWhatsAppUrl } from "@/lib/shareCaseStudy";

interface Props {
  study: CaseStudy;
  variant?: "icon" | "full";
  className?: string;
}

/**
 * Share a case study as a project reference.
 * Icon variant: native share sheet where available, otherwise copies the link.
 * Full variant: explicit copy-link and WhatsApp actions.
 */
const ShareCaseStudy = ({ study, variant = "icon", className = "" }: Props) => {
  const [copied, setCopied] = useState(false);

  const url = caseStudyShareUrl(study.slug);
  const text = caseStudyShareText(study);
  const whatsAppUrl = caseStudyWhatsAppUrl(study);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. permission denied) — leave state unchanged.
    }
  };

  const handleIconShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `${study.client} — ${study.title}`, text, url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    await copyLink();
  };

  if (variant === "full") {
    return (
      <div className={className}>
        <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/50 mb-3">
          Share this project as a reference
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 border border-foreground/25 px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-foreground/80 hover:text-foreground hover:border-foreground transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {copied ? "Link copied" : "Copy link"}
          </button>
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-foreground/25 px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-foreground/80 hover:text-foreground hover:border-foreground transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Share on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleIconShare}
      title="Share this project"
      aria-label={`Share ${study.client} project`}
      className={`inline-flex items-center justify-center p-2 bg-background/90 border border-foreground/15 text-foreground/70 hover:text-foreground hover:border-foreground/40 transition-colors ${className}`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </button>
  );
};

export default ShareCaseStudy;
