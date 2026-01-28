import { Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { submitSupportForm } from "@/lib/formSubmission";

const LeadMagnet = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      await submitSupportForm({
        full_name: "Lead Magnet Download",
        email: email,
        category: "IT Audit Checklist Download",
        description: `Lead magnet download request from: ${email}`,
      });

      toast({
        title: "Success!",
        description: "Check your inbox for the IT Audit Checklist.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-accent">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent-foreground/10 px-4 py-2 rounded-full mb-8">
            <Download className="w-5 h-5 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">Free Resource</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-accent-foreground mb-6">
            Get Your Free IT Audit Checklist
          </h2>

          <p className="text-xl text-accent-foreground/80 mb-10 max-w-2xl mx-auto">
            Identify gaps in your IT infrastructure with our comprehensive checklist. Used by 500+ South African businesses.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-14 text-lg bg-accent-foreground text-primary placeholder:text-primary/50 border-0"
              required
            />
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Sending..." : "Download Now"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <p className="text-sm text-accent-foreground/60 mt-4">
            No spam, ever. We respect your inbox.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;
