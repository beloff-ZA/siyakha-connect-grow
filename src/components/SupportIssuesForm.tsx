import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  UtensilsCrossed, 
  GraduationCap, 
  Building2, 
  Laptop, 
  FileText, 
  Wrench, 
  Wifi, 
  WifiOff, 
  Users, 
  Settings, 
  Link, 
  Phone, 
  Zap,
  ArrowLeft,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const supportSchema = z.object({
  issue: z.string().min(10, "Please describe your issue in detail (at least 10 characters)"),
  sector: z.enum(["retailer", "restaurant", "school", "office"], {
    required_error: "Please select your sector",
  }),
  needs: z.array(z.string()).min(1, "Please select at least one need"),
  helpDescription: z.string().min(5, "Please tell us how we can help you"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
});

type SupportFormData = z.infer<typeof supportSchema>;

const SECTORS = [
  { id: "retailer", label: "Retailer", icon: Store, color: "text-blue-600" },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed, color: "text-orange-600" },
  { id: "school", label: "School", icon: GraduationCap, color: "text-green-600" },
  { id: "office", label: "Office", icon: Building2, color: "text-purple-600" },
];

const NEEDS = [
  { id: "hardware", label: "Need Hardware", icon: Laptop },
  { id: "sla", label: "Need SLA", icon: FileText },
  { id: "support", label: "Need Support", icon: Wrench },
  { id: "network", label: "Network Issues", icon: Link },
  { id: "wifi", label: "Wi-Fi Problems", icon: WifiOff },
  { id: "guest-wifi", label: "Guest Wi-Fi Access", icon: Wifi },
  { id: "back-office", label: "Back-of-House Systems", icon: Settings },
  { id: "connectivity", label: "Connectivity Concerns", icon: Link },
  { id: "voip", label: "VoIP Services", icon: Phone },
  { id: "environmental", label: "Environmental Challenges", icon: Zap },
];

interface SupportIssuesFormProps {
  onClose: () => void;
}

export default function SupportIssuesForm({ onClose }: SupportIssuesFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      issue: "",
      sector: undefined,
      needs: [],
      helpDescription: "",
      phone: "",
      email: "",
    },
  });

  const progress = (currentStep / 5) * 100;

  const nextStep = async () => {
    let fieldsToValidate: (keyof SupportFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["issue"];
        break;
      case 2:
        fieldsToValidate = ["sector"];
        break;
      case 3:
        fieldsToValidate = ["needs"];
        break;
      case 4:
        fieldsToValidate = ["helpDescription"];
        break;
      case 5:
        fieldsToValidate = ["phone", "email"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: SupportFormData) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        full_name: "Support Request",
        email: data.email,
        phone: data.phone,
        category: `${data.sector} - ${data.needs.join(", ")}`,
        description: `Issue: ${data.issue}\n\nSector: ${data.sector}\n\nNeeds: ${data.needs.join(", ")}\n\nHow we can help: ${data.helpDescription}`,
        message: data.helpDescription,
      };

      const response = await fetch("/api/log-support-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      toast({
        title: "Form submitted successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error submitting form",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleNeed = (needId: string) => {
    const currentNeeds = form.getValues("needs");
    const updatedNeeds = currentNeeds.includes(needId)
      ? currentNeeds.filter(id => id !== needId)
      : [...currentNeeds, needId];
    form.setValue("needs", updatedNeeds);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary">
              Tell Us Your Issue
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of 5</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Tell Us Your Issue */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-primary mb-2">What's affecting you?</h3>
                    <p className="text-muted-foreground">Share all the challenges or requests in detail</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="issue"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your IT challenges, network issues, support needs, or any technical problems you're experiencing..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Who Are You */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-primary mb-2">Who Are You?</h3>
                    <p className="text-muted-foreground">Pick your sector for personalized solutions</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            {SECTORS.map((sector) => {
                              const Icon = sector.icon;
                              const isSelected = field.value === sector.id;
                              return (
                                <div
                                  key={sector.id}
                                  className={cn(
                                    "p-6 border-2 rounded-lg cursor-pointer transition-all hover:scale-105",
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  )}
                                  onClick={() => field.onChange(sector.id)}
                                >
                                  <div className="text-center">
                                    <Icon className={cn("h-12 w-12 mx-auto mb-3", sector.color)} />
                                    <h4 className="font-semibold text-foreground">{sector.label}</h4>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: What Do You Need */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-primary mb-2">What Do You Need?</h3>
                    <p className="text-muted-foreground">Select one or more services (click to toggle)</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="needs"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-3">
                            {NEEDS.map((need) => {
                              const Icon = need.icon;
                              const isSelected = form.watch("needs").includes(need.id);
                              return (
                                <div
                                  key={need.id}
                                  className={cn(
                                    "p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105",
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  )}
                                  onClick={() => toggleNeed(need.id)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <Icon className="h-6 w-6 text-primary flex-shrink-0" />
                                    <span className="text-sm font-medium text-foreground">{need.label}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 4: How Can We Help */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-primary mb-2">How Can We Help You?</h3>
                    <p className="text-muted-foreground">Give us context in your own words</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="helpDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us briefly how we can help you achieve your goals or solve your challenges..."
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 5: Contact Details */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-primary mb-2">Contact Details</h3>
                    <p className="text-muted-foreground">How can we reach you?</p>
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Cell Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="+27 12 345 6789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@company.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        Submit
                        <CheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}