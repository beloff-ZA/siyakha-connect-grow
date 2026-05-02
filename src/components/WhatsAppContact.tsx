import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

const WhatsAppContact = () => {
  const { t } = useTranslation();
  const services = (t("whatsapp.services", { returnObjects: true }) as { value: string; label: string }[]) || [];
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
    <>
      <a
        href="https://wa.me/27815012993?call=1"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Call +27 81 501 2993"
        className="fixed bottom-6 right-44 z-50 inline-flex items-center justify-center rounded-full h-12 px-5 bg-background text-foreground border border-foreground hover:bg-foreground hover:text-background transition-colors shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.4)] text-sm font-medium"
      >
        <Phone className="mr-2 h-5 w-5" strokeWidth={1.25} />
        <span className="hidden sm:inline">{t("whatsapp.callButtonFull")}</span>
        <span className="sm:hidden">{t("whatsapp.callButtonShort")}</span>
      </a>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 z-50 rounded-full h-12 px-5 bg-foreground text-background border border-foreground hover:bg-background hover:text-foreground transition-colors shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.4)]"
            aria-label="Chat with us on WhatsApp"
          >
            <MessageCircle className="mr-2 h-5 w-5" strokeWidth={1.25} /> {t("whatsapp.chatButton")}
          </Button>
        </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("whatsapp.dialogTitle")}</DialogTitle>
          <DialogDescription>{t("whatsapp.dialogDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">{t("whatsapp.fullName")}</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">{t("whatsapp.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="phone">{t("whatsapp.phone")}</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="service">{t("whatsapp.service")}</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger id="service">
                  <SelectValue placeholder={t("whatsapp.selectService") as string} />
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
            <Label htmlFor="message">{t("whatsapp.messageOptional")}</Label>
            <Input id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("whatsapp.messagePlaceholder") as string} />
          </div>
          <DialogFooter>
            <Button type="submit" className="cta-primary">{t("whatsapp.submit")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppContact;
