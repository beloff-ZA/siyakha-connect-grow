
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
const schema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  contact_number: z.string().min(5, "Please enter a valid contact number"),
  whatsapp_number: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  category: z.string().min(2, "Please select a category"),
  description: z.string().min(10, "Please provide a brief description"),
});

type FormValues = z.infer<typeof schema>;

const categories = [
  "Technical Support",
  "Network Issue",
  "Security & Surveillance",
  "Cloud & Edge Solutions",
  "Collaboration Tools",
  "Other",
];

const LogIt: React.FC = () => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    console.log("[LogIt] Submitting payload", values);
    const { data, error } = await supabase.functions.invoke("log-support-call", {
      body: { ...values, preferred_channel: "email" },
    });
    if (error) {
      console.error("[LogIt] Submission error", error);
      toast({
        title: "Something went wrong",
        description: "We couldn’t log your request. Please try again.",
        variant: "destructive",
      });
      return;
    }
    console.log("[LogIt] Submission success", data);
    toast({
      title: "Request submitted",
      description: "Thank you! Our support team will contact you shortly.",
    });
    reset();
  };

  const selectedCategory = watch("category");

  // SEO setup
  useEffect(() => {
    const title = "Log It | Siyakha Technology Support";
    const description = "Log your IT support request. Fast response from Siyakha Technology’s support team.";
    document.title = title;

    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(key, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    ensureMeta("name", "description", description);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}/log-it`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/log-it`);
  }, []);

  const contactJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Log IT Support Request",
    url: `${window.location.origin}/log-it`,
    description: "Log an IT support request with Siyakha Technology.",
    publisher: {
      "@type": "Organization",
      name: "Siyakha Technology Solutions",
      url: `${window.location.origin}`,
    },
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Support request background" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <header className="max-w-3xl">
              <p className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-4">
                Support
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4">Log It</h1>
              <p className="text-lg text-muted-foreground">
                Log an issue or request — our support team will respond quickly.
              </p>
            </header>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-6 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Support request details</CardTitle>
                  <CardDescription>Please provide a few details so we can assist you faster.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="full_name">Full name</Label>
                        <Input id="full_name" autoComplete="name" placeholder="Your full name" {...register("full_name")} />
                        {errors.full_name && <p className="mt-1 text-sm text-destructive">{errors.full_name.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="email">Email address</Label>
                        <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
                        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="contact_number">Contact number</Label>
                        <Input id="contact_number" type="tel" autoComplete="tel" placeholder="+27 ..." {...register("contact_number")} />
                        {errors.contact_number && <p className="mt-1 text-sm text-destructive">{errors.contact_number.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="whatsapp_number">WhatsApp number</Label>
                        <Input id="whatsapp_number" type="tel" autoComplete="tel" placeholder="+27 ..." {...register("whatsapp_number")} />
                        {errors.whatsapp_number && <p className="mt-1 text-sm text-destructive">{errors.whatsapp_number.message}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="category">Type or category of support required</Label>
                        <Select
                          value={selectedCategory ?? ""}
                          onValueChange={(v) => setValue("category", v, { shouldValidate: true })}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Call logging details (describe the issue)</Label>
                      <Textarea id="description" placeholder="Brief description of the issue" rows={6} {...register("description")} />
                      {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        By submitting this form, you consent to being contacted by our team regarding your request.
                      </p>
                      <Button type="submit" className="cta-primary" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit request"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <aside>
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Need urgent help?</CardTitle>
                  <CardDescription>Reach us directly via the channels below.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-accent" />
                      <a href="tel:+27815012993" className="text-foreground hover:text-primary transition-colors">081 501 2993</a>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-accent" />
                      <a href="tel:+27815012993" className="text-foreground hover:text-primary transition-colors">081 501 2993</a>
                    </li>
                    <li className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-accent" />
                      <a href="mailto:accounts@siyakhatechnology.co.za" className="text-foreground hover:text-primary transition-colors">accounts@siyakhatechnology.co.za</a>
                    </li>
                    <li className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-accent" />
                      <a href="https://wa.me/0000000000" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">Chat on WhatsApp</a>
                    </li>
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-accent mt-0.5" />
                      <p className="text-sm text-muted-foreground">We’ll confirm receipt by email and keep you updated.</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />
    </div>
  );
};

export default LogIt;
