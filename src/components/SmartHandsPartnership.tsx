import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Handshake, MapPin, Users, Wrench, ArrowRight } from "lucide-react";
const partnershipSchema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  contact_person: z.string().min(2, "Contact person name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  location: z.string().min(2, "Location is required"),
  services: z.string().min(10, "Please describe your services"),
  coverage_area: z.string().min(5, "Please describe your coverage area"),
  experience: z.string().min(10, "Please describe your experience"),
});

type PartnershipFormData = z.infer<typeof partnershipSchema>;

export default function SmartHandsPartnership() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PartnershipFormData>({
    resolver: zodResolver(partnershipSchema),
    defaultValues: {
      company_name: "",
      contact_person: "",
      email: "",
      phone: "",
      location: "",
      services: "",
      coverage_area: "",
      experience: "",
    },
  });

  const onSubmit = async (data: PartnershipFormData) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        full_name: `${data.contact_person} (${data.company_name})`,
        email: data.email,
        phone: data.phone,
        category: "Smart Hands Partnership",
        description: `Partnership Inquiry from ${data.company_name}

Contact Person: ${data.contact_person}
Location: ${data.location}
Coverage Area: ${data.coverage_area}

Services Offered:
${data.services}

Experience & Capabilities:
${data.experience}`,
      };

      const { data: result, error } = await supabase.functions.invoke("log-support-call", {
        body: payload,
      });

      if (error) throw error;

      toast({
        title: "Partnership inquiry submitted!",
        description: "We'll review your application and get back to you within 48 hours.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error submitting inquiry",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="py-16 md:py-24 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Handshake className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary">
                Are You an IT Company?
              </h2>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8">
              Partner with us for smart hands services and expand your reach across multiple regions.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Regional Coverage</h3>
                  <p className="text-muted-foreground">
                    Extend your service offerings across EMEA, North America, and emerging markets through our partnership network.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Skilled Technicians</h3>
                  <p className="text-muted-foreground">
                    Access to certified field engineers and technical specialists for on-site support and installations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Wrench className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Smart Hands Services</h3>
                  <p className="text-muted-foreground">
                    Professional on-site technical support, hardware installations, maintenance, and emergency response services.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Let's Partner Up</CardTitle>
              <p className="text-muted-foreground">
                Fill out this form to explore partnership opportunities
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your IT Company" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contact_person"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="john@yourcompany.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 234 567 8900" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="coverage_area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coverage Area</FormLabel>
                          <FormControl>
                            <Input placeholder="Regional coverage" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Services You Offer</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your technical services, specializations, and capabilities..."
                            className="min-h-[80px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience & Team</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your team size, years of experience, certifications, and notable projects..."
                            className="min-h-[80px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        Submit Partnership Inquiry
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}