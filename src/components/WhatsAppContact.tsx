import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, PhoneCall, X } from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  { value: "it-support", label: "IT Support / Managed Services" },
  { value: "networking", label: "Networking & Wi-Fi" },
  { value: "security", label: "CCTV, Security & Access Control" },
  { value: "cloud", label: "Cloud, Backup & Microsoft 365" },
  { value: "voip", label: "VoIP & Connectivity" },
  { value: "field-support", label: "Field Support / Smart Hands" },
];

const WhatsAppContact = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !service) return;

    const text = `New WhatsApp enquiry%0A%0AName: ${encodeURIComponent(fullName)}%0AEmail: ${encodeURIComponent(email)}%0APhone: ${encodeURIComponent(phone)}%0AService: ${encodeURIComponent(service)}%0AMessage: ${encodeURIComponent(message || "(none)")}`;
    const url = `https://wa.me/27815012993?text=${text}`;
    window.open(url, "_blank");
    setOpen(false);
  };

  return (
    <>
      {/* Floating Button Group */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Expanded Options */}
        {expanded && (
          <div className="flex flex-col gap-2 animate-fade-up">
            {/* Request Callback */}
            <Button
              onClick={() => {
                setOpen(true);
                setExpanded(false);
              }}
              className="rounded-full shadow-lg h-12 px-5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <PhoneCall className="mr-2 h-5 w-5" /> Request Callback
            </Button>
            
            {/* Direct WhatsApp */}
            <Button
              onClick={() => window.open("https://wa.me/27815012993", "_blank")}
              className="rounded-full shadow-lg h-12 px-5 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
            </Button>
          </div>
        )}

        {/* Main Toggle Button */}
        <Button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "rounded-full shadow-lg h-14 w-14 p-0 transition-all",
            expanded 
              ? "bg-muted text-foreground hover:bg-muted/90" 
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          )}
          aria-label={expanded ? "Close contact options" : "Open contact options"}
        >
          {expanded ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Callback Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick WhatsApp Enquiry</DialogTitle>
            <DialogDescription>
              Tell us how to reach you and what you need. We'll start a WhatsApp chat with your details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="service">Service</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message (optional)</Label>
              <Input id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Briefly describe your need" />
            </div>
            <DialogFooter>
              <Button type="submit" className="cta-primary">Start WhatsApp Chat</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppContact;
