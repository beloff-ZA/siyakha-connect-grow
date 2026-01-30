import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2, FileText } from "lucide-react";

const applicationSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").max(255),
  phone: z.string().min(10, "Please enter a valid phone number").max(20).optional().or(z.literal("")),
  years_experience: z.string().optional(),
  current_employer: z.string().max(100).optional().or(z.literal("")),
  linkedin_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  cover_letter: z.string().max(2000, "Cover letter must be under 2000 characters").optional().or(z.literal("")),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface Job {
  id: string;
  title: string;
  location: string;
  department: string;
}

interface JobApplicationFormProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobApplicationForm = ({ job, open, onOpenChange }: JobApplicationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF or Word document");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB");
        return;
      }
      setCvFile(file);
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!job) return;
    if (!cvFile) {
      toast.error("Please upload your CV");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload CV to storage
      const fileExt = cvFile.name.split(".").pop();
      const fileName = `${job.id}/${Date.now()}-${data.full_name.replace(/\s+/g, "-")}.${fileExt}`;
      
      setUploadProgress(30);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(fileName, cvFile);

      if (uploadError) throw uploadError;
      
      setUploadProgress(60);

      // Create application record
      const { error: insertError } = await supabase
        .from("job_applications")
        .insert({
          job_id: job.id,
          full_name: data.full_name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone?.trim() || null,
          cv_url: uploadData.path,
          cover_letter: data.cover_letter?.trim() || null,
          years_experience: data.years_experience ? parseInt(data.years_experience) : null,
          current_employer: data.current_employer?.trim() || null,
          linkedin_url: data.linkedin_url?.trim() || null,
        });

      if (insertError) throw insertError;

      setUploadProgress(100);
      setSubmitted(true);
      toast.success("Application submitted successfully!");
      
      // Reset after delay
      setTimeout(() => {
        reset();
        setCvFile(null);
        setSubmitted(false);
        onOpenChange(false);
      }, 3000);

    } catch (error: unknown) {
      console.error("Application error:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setCvFile(null);
      setSubmitted(false);
      onOpenChange(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-primary mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground">
              Thank you for applying for {job.title}. We'll review your application and get back to you soon.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Apply for {job.title}</DialogTitle>
              <DialogDescription>
                {job.department} • {job.location}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    {...register("full_name")}
                    className={errors.full_name ? "border-destructive" : ""}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">{errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+27 XX XXX XXXX"
                    {...register("phone")}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="5"
                    {...register("years_experience")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_employer">Current Employer</Label>
                  <Input
                    id="current_employer"
                    placeholder="Company name"
                    {...register("current_employer")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    {...register("linkedin_url")}
                    className={errors.linkedin_url ? "border-destructive" : ""}
                  />
                  {errors.linkedin_url && (
                    <p className="text-sm text-destructive">{errors.linkedin_url.message}</p>
                  )}
                </div>
              </div>

              {/* CV Upload */}
              <div className="space-y-2">
                <Label>Upload CV / Resume *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
                  <input
                    type="file"
                    id="cv-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-accent" />
                        <div className="text-left">
                          <p className="font-medium text-foreground">{cvFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PDF, DOC, DOCX (max 10MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-2">
                <Label htmlFor="cover_letter">Cover Letter (Optional)</Label>
                <Textarea
                  id="cover_letter"
                  placeholder="Tell us why you're interested in this role and what makes you a great fit..."
                  rows={5}
                  {...register("cover_letter")}
                  className={errors.cover_letter ? "border-destructive" : ""}
                />
                {errors.cover_letter && (
                  <p className="text-sm text-destructive">{errors.cover_letter.message}</p>
                )}
              </div>

              {/* Progress bar during upload */}
              {isSubmitting && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {uploadProgress < 100 ? "Uploading..." : "Processing..."}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full cta-primary py-6 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationForm;
