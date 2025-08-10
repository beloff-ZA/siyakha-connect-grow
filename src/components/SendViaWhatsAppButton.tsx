import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { markWhatsAppSent, sendViaWhatsApp } from "@/lib/whatsapp";

interface Props {
  phoneE164: string;
  message: string;
  ticketId: string;
  className?: string;
}

const SendViaWhatsAppButton: React.FC<Props> = ({ phoneE164, message, ticketId, className }) => {
  const { toast } = useToast();

  const onClick = async () => {
    try {
      const { messageId, opened } = await sendViaWhatsApp({ phoneE164, message, ticketId });
      if (!opened) {
        await navigator.clipboard?.writeText(message);
        toast({ title: "Popup blocked", description: "We copied the message. Paste it into WhatsApp." });
      }
      toast({
        title: "WhatsApp opened",
        description: "After sending, mark the message as sent for audit.",
        action: (
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await markWhatsAppSent({ messageId, ticketId });
                toast({ title: "Marked as sent", description: "The timeline has been updated." });
              } catch (e: any) {
                toast({ title: "Could not mark as sent", description: e?.message || "Try again" });
              }
            }}
          >
            Mark as sent
          </Button>
        ),
      });
    } catch (e: any) {
      toast({ title: "Failed to start WhatsApp", description: e?.message || "Try again", variant: "destructive" as any });
    }
  };

  return (
    <Button onClick={onClick} className={className} aria-label="Send via WhatsApp">
      <MessageCircle className="mr-2" /> WhatsApp
    </Button>
  );
};

export default SendViaWhatsAppButton;
