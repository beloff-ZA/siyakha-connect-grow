import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle } from "lucide-react";

const services = [
  { value: "infrastructure-and-networking", label: "Infrastructure & Networking" },
  { value: "security-and-surveillance", label: "Security & Surveillance" },
  { value: "cloud-and-edge-solutions", label: "Cloud & Edge Solutions" },
  { value: "smart-collaboration-tools", label: "Smart Collaboration Tools" },
];

const WhatsAppContact = () => {
  const [open, setOpen] = useState(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 rounded-full shadow-lg h-12 px-5 bg-accent text-accent-foreground hover:bg-accent/90"
          aria-label="Chat with us on WhatsApp"
        >
          <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick WhatsApp Enquiry</DialogTitle>
          <DialogDescription>
            Tell us how to reach you and what you need. We’ll start a WhatsApp chat with your details.
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
  );
};

export default WhatsAppContact;
