import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Monitor, 
  Wifi, 
  Shield, 
  Cloud, 
  Phone, 
  Wrench,
  MapPin,
  Building2,
  GraduationCap,
  Store,
  Factory,
  Network,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitSupportForm } from "@/lib/formSubmission";
import { useToast } from "@/hooks/use-toast";

interface WizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const services = [
  { id: "it-support", label: "IT Support / Managed Services", icon: Monitor, benefits: ["24/7 helpdesk", "Proactive monitoring", "Reduced downtime"] },
  { id: "networking", label: "Networking / Wi-Fi", icon: Wifi, benefits: ["Enterprise-grade Wi-Fi", "Network design", "Seamless connectivity"] },
  { id: "security", label: "CCTV / Security / Access Control", icon: Shield, benefits: ["HD surveillance", "Access management", "Remote monitoring"] },
  { id: "cloud", label: "Cloud / Backup / Microsoft 365", icon: Cloud, benefits: ["Data protection", "Office 365 setup", "Cloud migration"] },
  { id: "voip", label: "VoIP / Connectivity", icon: Phone, benefits: ["Crystal-clear calls", "Cost savings", "Unified communications"] },
  { id: "field-support", label: "On-site Smart Hands / Field Support", icon: Wrench, benefits: ["Nationwide coverage", "Fast response", "Skilled technicians"] },
];

const locations = [
  { id: "johannesburg", label: "Johannesburg / Gauteng" },
  { id: "cape-town", label: "Cape Town / Western Cape" },
  { id: "durban", label: "Durban / KwaZulu-Natal" },
  { id: "pretoria", label: "Pretoria / Tshwane" },
  { id: "other", label: "Other Province" },
  { id: "nationwide", label: "Nationwide / Multiple Locations" },
];

const environments = [
  { id: "school", label: "School / Educational", icon: GraduationCap },
  { id: "office", label: "Office / SME", icon: Building2 },
  { id: "retail", label: "Retail", icon: Store },
  { id: "industrial", label: "Industrial / Warehouse", icon: Factory },
  { id: "multi-site", label: "Multi-site / Franchise", icon: Network },
];

const urgencies = [
  { id: "critical", label: "Today / Critical Outage", icon: AlertTriangle, color: "text-red-500" },
  { id: "this-week", label: "This Week", icon: Clock, color: "text-amber-500" },
  { id: "planning", label: "Planning a Project", icon: Calendar, color: "text-accent" },
];

const testimonials: Record<string, { quote: string; author: string; role: string }> = {
  "it-support": { quote: "Siyakha has been instrumental in managing our complete IT ecosystem.", author: "Brian", role: "Operations Lead, Zizwe DSD" },
  "networking": { quote: "They are efficient, reliable and professional. With great customer support.", author: "Mandy Laing", role: "Client" },
  "security": { quote: "Their expertise, responsiveness, and dedication give us confidence.", author: "Mfundo", role: "School Administrator" },
  "cloud": { quote: "These folks turned our digital dreams into reality! Emails flowing smoothly.", author: "Boikano Pule", role: "Client" },
  "voip": { quote: "Their team responded instantly — they connected remotely and resolved everything quickly.", author: "Emmy Trish", role: "The Pelican Club, Bahrain" },
  "field-support": { quote: "Siyakha has been a trusted partner for our major ICT needs.", author: "Mfundo", role: "Marist Brothers School" },
};

const FindMySolutionWizard = ({ open, onOpenChange }: WizardProps) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", company: "", phone: "", email: "", problem: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const selectedServiceData = services.find(s => s.id === selectedService);
    const selectedLocationData = locations.find(l => l.id === selectedLocation);
    const selectedEnvironmentData = environments.find(e => e.id === selectedEnvironment);
    const selectedUrgencyData = urgencies.find(u => u.id === selectedUrgency);

    const message = `
Find My Solution Wizard Submission

Contact Details:
- Name: ${formData.name}
- Company: ${formData.company || "Not provided"}
- Phone: ${formData.phone}
- Email: ${formData.email}

Selected Options:
- Service: ${selectedServiceData?.label || "Not selected"}
- Location: ${selectedLocationData?.label || "Not selected"}
- Environment: ${selectedEnvironmentData?.label || "Not selected"}
- Urgency: ${selectedUrgencyData?.label || "Not selected"}

Problem Description:
${formData.problem || "Not provided"}
    `.trim();

    try {
      await submitSupportForm({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        contact_number: formData.phone,
        category: `Find My Solution: ${selectedServiceData?.label || "Enquiry"}`,
        description: message,
      });

      setIsComplete(true);
      toast({ title: "Thank you!", description: "We'll be in touch shortly." });
    } catch (error) {
      toast({ title: "Something went wrong", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedLocation(null);
    setSelectedEnvironment(null);
    setSelectedUrgency(null);
    setFormData({ name: "", company: "", phone: "", email: "", problem: "" });
    setIsComplete(false);
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedService;
      case 2: return !!selectedLocation;
      case 3: return !!selectedEnvironment;
      case 4: return !!selectedUrgency;
      default: return true;
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const testimonial = selectedService ? testimonials[selectedService] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Find My Solution</DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all",
                  i + 1 <= step ? "bg-accent" : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Step {step} of {totalSteps}</p>
        </DialogHeader>

        {isComplete ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
            <p className="text-muted-foreground mb-6">
              We've received your enquiry and will be in touch within 24 hours.
            </p>
            <Button onClick={resetWizard} className="cta-primary">
              Close
            </Button>
          </div>
        ) : (
          <div className="py-4">
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What do you need help with?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((service) => {
                    const Icon = service.icon;
                    return (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all hover:border-accent/50",
                          selectedService === service.id
                            ? "border-accent bg-accent/5"
                            : "border-border"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg",
                          selectedService === service.id ? "bg-accent text-accent-foreground" : "bg-muted"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-medium block">{service.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Where are you based?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(location.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all hover:border-accent/50",
                        selectedLocation === location.id
                          ? "border-accent bg-accent/5"
                          : "border-border"
                      )}
                    >
                      <MapPin className={cn(
                        "w-5 h-5",
                        selectedLocation === location.id ? "text-accent" : "text-muted-foreground"
                      )} />
                      <span className="font-medium">{location.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Environment */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What's your environment?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {environments.map((env) => {
                    const Icon = env.icon;
                    return (
                      <button
                        key={env.id}
                        onClick={() => setSelectedEnvironment(env.id)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all hover:border-accent/50",
                          selectedEnvironment === env.id
                            ? "border-accent bg-accent/5"
                            : "border-border"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg",
                          selectedEnvironment === env.id ? "bg-accent text-accent-foreground" : "bg-muted"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{env.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Urgency */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">How urgent is this?</h3>
                <div className="grid grid-cols-1 gap-3">
                  {urgencies.map((urgency) => {
                    const Icon = urgency.icon;
                    return (
                      <button
                        key={urgency.id}
                        onClick={() => setSelectedUrgency(urgency.id)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:border-accent/50",
                          selectedUrgency === urgency.id
                            ? "border-accent bg-accent/5"
                            : "border-border"
                        )}
                      >
                        <Icon className={cn("w-6 h-6", urgency.color)} />
                        <span className="font-medium text-lg">{urgency.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Results + Lead Capture */}
            {step === 5 && (
              <div className="space-y-6">
                {/* Recommended Package */}
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    Recommended: {selectedServiceData?.label}
                  </h3>
                  <ul className="space-y-2 mb-4">
                    {selectedServiceData?.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    <strong>Estimated timeline:</strong> {selectedUrgency === "critical" ? "Same-day response" : selectedUrgency === "this-week" ? "1-3 business days" : "Scheduled at your convenience"}
                  </p>
                </div>

                {/* Testimonial */}
                {testimonial && (
                  <div className="bg-muted/50 rounded-xl p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm italic mt-2">"{testimonial.quote}"</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      — {testimonial.author}, {testimonial.role}
                    </p>
                  </div>
                )}

                {/* Lead Capture Form */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Get Your Free Consultation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wizard-name">Name *</Label>
                      <Input
                        id="wizard-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="wizard-company">Company</Label>
                      <Input
                        id="wizard-company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="wizard-phone">Phone *</Label>
                      <Input
                        id="wizard-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="wizard-email">Email *</Label>
                      <Input
                        id="wizard-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="wizard-problem">Brief Problem Description</Label>
                    <Textarea
                      id="wizard-problem"
                      value={formData.problem}
                      onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                      placeholder="Tell us briefly about your needs..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <Button onClick={handleNext} disabled={!canProceed()} className="cta-primary">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="cta-primary">
                  {isSubmitting ? "Submitting..." : "Book Free Consultation"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FindMySolutionWizard;
