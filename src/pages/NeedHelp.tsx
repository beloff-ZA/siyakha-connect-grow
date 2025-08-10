
import React from "react";
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

const NeedHelp: React.FC = () => {
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
    console.log("[NeedHelp] Submitting payload", values);
    const { data, error } = await supabase.functions.invoke("log-support-call", {
      body: { ...values, preferred_channel: "email" },
    });
    if (error) {
      console.error("[NeedHelp] Submission error", error);
      toast({
        title: "Something went wrong",
        description: "We couldn’t log your request. Please try again.",
        variant: "destructive",
      });
      return;
    }
    console.log("[NeedHelp] Submission success", data);
    toast({
      title: "Request submitted",
      description: "Thank you! Our support team will contact you shortly.",
    });
    reset();
  };

  const selectedCategory = watch("category");

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Need Help? We’re Here for You</h1>
          <p className="mt-3 text-muted-foreground">
            Welcome — this is your direct line to Siyakha Technology’s support team. Fill in the form below to log your request.
            We’ll send it to our system and notify our team immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" placeholder="Your full name" {...register("full_name")} />
              {errors.full_name && <p className="mt-1 text-sm text-destructive">{errors.full_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="contact_number">Contact number</Label>
              <Input id="contact_number" type="tel" placeholder="+27 ..." {...register("contact_number")} />
              {errors.contact_number && <p className="mt-1 text-sm text-destructive">{errors.contact_number.message}</p>}
            </div>
            <div>
              <Label htmlFor="whatsapp_number">WhatsApp number</Label>
              <Input id="whatsapp_number" type="tel" placeholder="+27 ..." {...register("whatsapp_number")} />
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
      </div>
    </div>
  );
};

export default NeedHelp;
