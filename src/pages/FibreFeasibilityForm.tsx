import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, ArrowRight, Calculator, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  // Contact Information
  contactName: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  areaName: z.string().min(2, "Area name is required"),
  
  // Demand & Revenue (25%)
  serviceablePremises: z.number().min(1, "Must be at least 1"),
  densityPerKm: z.number().min(1, "Density is required"),
  verifiedDemand: z.string().min(1, "Please specify verified demand"),
  takeRate6Months: z.number().min(0).max(100, "Must be between 0-100%"),
  takeRate12Months: z.number().min(0).max(100, "Must be between 0-100%"),
  takeRate24Months: z.number().min(0).max(100, "Must be between 0-100%"),
  expectedARPU: z.number().min(1, "ARPU is required"),
  priceSensitivity: z.enum(["low", "medium", "high"]),
  
  // Competition & Market (15%)
  existingProviders: z.string().min(1, "Please list existing providers"),
  competitorBuilds: z.enum(["none", "planned", "imminent"]),
  differentiationStrategy: z.string().min(10, "Please describe your strategy"),
  
  // Technical Feasibility (15%)
  backhaul: z.enum(["excellent", "good", "fair", "poor"]),
  civilComplexity: z.enum(["low", "medium", "high"]),
  powerAvailability: z.enum(["stable", "intermittent", "unreliable"]),
  topologyType: z.enum(["gpon", "xgs-pon", "mixed"]),
  averageDropLength: z.number().min(1, "Drop length is required"),
  
  // Permissions & Community (10%)
  municipalStance: z.enum(["supportive", "neutral", "resistant"]),
  hoaAgreements: z.enum(["signed", "pending", "none"]),
  wayleaveStatus: z.enum(["secured", "pending", "needed"]),
  
  // Financials & Risk (15%)
  capexPerHP: z.number().min(1, "CAPEX per home passed is required"),
  capexPerConnected: z.number().min(1, "CAPEX per connected home is required"),
  monthlyOpex: z.number().min(1, "Monthly OPEX is required"),
  paybackPeriod: z.number().min(1, "Payback period is required"),
  securityRisk: z.enum(["low", "medium", "high"]),
  
  // Operations (5%)
  localContractors: z.enum(["available", "limited", "none"]),
  installCapacity: z.enum(["high", "medium", "low"]),
  
  // Additional Information
  additionalNotes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const FibreFeasibilityForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  
  const totalSteps = 7;
  
  useEffect(() => {
    document.title = "Fibre Feasibility Assessment | Siyakha Technology Solutions";
    const description = "Complete our comprehensive fibre build feasibility assessment for your community. Get professional analysis and scoring for your area.";
    
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
    ensureMeta("property", "og:title", "Fibre Feasibility Assessment | Siyakha Technology Solutions");
    ensureMeta("property", "og:description", description);
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactName: "",
      company: "",
      email: "",
      phone: "",
      areaName: "",
      serviceablePremises: 0,
      densityPerKm: 0,
      verifiedDemand: "",
      takeRate6Months: 0,
      takeRate12Months: 0,
      takeRate24Months: 0,
      expectedARPU: 0,
      priceSensitivity: "medium",
      existingProviders: "",
      competitorBuilds: "none",
      differentiationStrategy: "",
      backhaul: "good",
      civilComplexity: "medium",
      powerAvailability: "stable",
      topologyType: "gpon",
      averageDropLength: 0,
      municipalStance: "neutral",
      hoaAgreements: "pending",
      wayleaveStatus: "pending",
      capexPerHP: 0,
      capexPerConnected: 0,
      monthlyOpex: 0,
      paybackPeriod: 0,
      securityRisk: "medium",
      localContractors: "available",
      installCapacity: "medium",
      additionalNotes: "",
    },
  });

  const calculateScore = (data: FormData): number => {
    let totalScore = 0;
    
    // Demand & Revenue (25%)
    let demandScore = 0;
    if (data.serviceablePremises >= 500) demandScore += 25;
    else if (data.serviceablePremises >= 200) demandScore += 20;
    else if (data.serviceablePremises >= 100) demandScore += 15;
    else demandScore += 10;
    
    if (data.densityPerKm >= 50) demandScore += 25;
    else if (data.densityPerKm >= 30) demandScore += 20;
    else if (data.densityPerKm >= 15) demandScore += 15;
    else demandScore += 10;
    
    if (data.takeRate24Months >= 40) demandScore += 25;
    else if (data.takeRate24Months >= 30) demandScore += 20;
    else if (data.takeRate24Months >= 20) demandScore += 15;
    else demandScore += 10;
    
    if (data.expectedARPU >= 600) demandScore += 25;
    else if (data.expectedARPU >= 400) demandScore += 20;
    else if (data.expectedARPU >= 300) demandScore += 15;
    else demandScore += 10;
    
    totalScore += (demandScore / 4) * 0.25 * 100;
    
    // Competition (15%)
    let competitionScore = 0;
    if (data.competitorBuilds === "none") competitionScore += 100;
    else if (data.competitorBuilds === "planned") competitionScore += 60;
    else competitionScore += 20;
    
    totalScore += competitionScore * 0.15;
    
    // Technical (15%)
    let techScore = 0;
    const backhaul = { excellent: 100, good: 80, fair: 60, poor: 30 };
    techScore += backhaul[data.backhaul] * 0.4;
    
    const complexity = { low: 100, medium: 70, high: 40 };
    techScore += complexity[data.civilComplexity] * 0.3;
    
    const power = { stable: 100, intermittent: 60, unreliable: 30 };
    techScore += power[data.powerAvailability] * 0.3;
    
    totalScore += techScore * 0.15;
    
    // Permissions (10%)
    let permissionsScore = 0;
    const municipal = { supportive: 100, neutral: 70, resistant: 30 };
    permissionsScore += municipal[data.municipalStance] * 0.4;
    
    const hoa = { signed: 100, pending: 60, none: 20 };
    permissionsScore += hoa[data.hoaAgreements] * 0.6;
    
    totalScore += permissionsScore * 0.10;
    
    // Financials (15%)
    let financialScore = 0;
    if (data.paybackPeriod <= 24) financialScore += 100;
    else if (data.paybackPeriod <= 36) financialScore += 80;
    else if (data.paybackPeriod <= 48) financialScore += 60;
    else financialScore += 30;
    
    const security = { low: 100, medium: 70, high: 40 };
    financialScore = (financialScore + security[data.securityRisk]) / 2;
    
    totalScore += financialScore * 0.15;
    
    // Operations (5%)
    let opsScore = 0;
    const contractors = { available: 100, limited: 60, none: 20 };
    opsScore += contractors[data.localContractors] * 0.6;
    
    const capacity = { high: 100, medium: 70, low: 40 };
    opsScore += capacity[data.installCapacity] * 0.4;
    
    totalScore += opsScore * 0.05;
    
    return Math.round(totalScore);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const calculatedScore = calculateScore(data);
      setScore(calculatedScore);
      
      const recommendation = calculatedScore >= 75 && data.paybackPeriod <= 36 ? "GO" : "NO-GO";
      
      const payload = {
        ...data,
        score: calculatedScore,
        recommendation,
        submissionDate: new Date().toISOString(),
      };

      const { error } = await supabase.functions.invoke("fibre-feasibility", {
        body: payload,
      });

      if (error) throw error;

      toast({
        title: "Assessment Submitted Successfully!",
        description: `Your feasibility assessment has been submitted with a score of ${calculatedScore}/100. Our team will review and respond within 24 hours.`,
      });
      
      // Show results
      setCurrentStep(8); // Results step
      
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, totalSteps));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1));
  
  const progress = (currentStep / totalSteps) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
              <CardDescription>Let us know who you are and which area you're interested in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company/Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
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
                        <Input placeholder="+27 XX XXX XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="areaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area/Community Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sandton CBD, Rosebank Estate" {...field} />
                    </FormControl>
                    <FormDescription>The specific area or community where fibre build is proposed</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Demand & Revenue Assessment
              </CardTitle>
              <CardDescription>Critical metrics for understanding market potential and revenue projections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="serviceablePremises"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serviceable Premises</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="500"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Total houses + MDUs</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="densityPerKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Density (homes per km)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="25"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="verifiedDemand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verified Demand</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe pre-registrations, petitions, LOIs, HOA sign-ups, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="takeRate6Months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Take Rate @ 6 Months (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="15"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="takeRate12Months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Take Rate @ 12 Months (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="25"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="takeRate24Months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Take Rate @ 24 Months (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="35"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expectedARPU"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected ARPU (R/month)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="450"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Average revenue per user by product tier</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceSensitivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Sensitivity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sensitivity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low - Premium market</SelectItem>
                          <SelectItem value="medium">Medium - Mixed market</SelectItem>
                          <SelectItem value="high">High - Price sensitive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Competition & Market Context</CardTitle>
              <CardDescription>Understanding the competitive landscape and positioning strategy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="existingProviders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Existing Providers</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List current providers: Openserve, MetroFibre, Frogfoot, 5G FWA, WISPs, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="competitorBuilds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competitor Build Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select competitor status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No imminent builds</SelectItem>
                        <SelectItem value="planned">Planned builds (12+ months)</SelectItem>
                        <SelectItem value="imminent">Imminent builds (&lt;12 months)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="differentiationStrategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Differentiation Strategy</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How will you differentiate from existing providers? Service quality, pricing, local support, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Technical Feasibility</CardTitle>
              <CardDescription>Infrastructure requirements and technical complexity assessment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="backhaul"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backhaul Access</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select backhaul quality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent - Direct fibre &lt;1km</SelectItem>
                          <SelectItem value="good">Good - Fibre accessible &lt;5km</SelectItem>
                          <SelectItem value="fair">Fair - Requires extension &lt;10km</SelectItem>
                          <SelectItem value="poor">Poor - Major infrastructure needed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="civilComplexity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Civil Complexity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select complexity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low - Easy trenching, good access</SelectItem>
                          <SelectItem value="medium">Medium - Some obstacles</SelectItem>
                          <SelectItem value="high">High - Rock, water, major crossings</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="powerAvailability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power Availability</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select power status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="stable">Stable - Reliable grid + backup</SelectItem>
                          <SelectItem value="intermittent">Intermittent - Some load shedding</SelectItem>
                          <SelectItem value="unreliable">Unreliable - Frequent outages</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="topologyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topology Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select topology" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gpon">GPON - Standard deployment</SelectItem>
                          <SelectItem value="xgs-pon">XGS-PON - High speed</SelectItem>
                          <SelectItem value="mixed">Mixed - Hybrid approach</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="averageDropLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average Drop Length (meters)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="50"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Average distance from street to property connection point</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Permissions & Community Enablement</CardTitle>
              <CardDescription>Regulatory and community approval status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="municipalStance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Municipal/Roads Authority Stance</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select municipal stance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="supportive">Supportive - Fast approvals, low fees</SelectItem>
                        <SelectItem value="neutral">Neutral - Standard process</SelectItem>
                        <SelectItem value="resistant">Resistant - Delays, moratoriums</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hoaAgreements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HOA/Body Corporate Agreements</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select agreement status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="signed">Signed - Agreements in place</SelectItem>
                          <SelectItem value="pending">Pending - In negotiation</SelectItem>
                          <SelectItem value="none">None - Not yet approached</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="wayleaveStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wayleave Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select wayleave status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="secured">Secured - Permissions granted</SelectItem>
                          <SelectItem value="pending">Pending - Applications submitted</SelectItem>
                          <SelectItem value="needed">Needed - Not yet applied</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Financials & Risk Assessment</CardTitle>
              <CardDescription>Investment requirements and risk factors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capexPerHP"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CAPEX per Home Passed (R)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="3500"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="capexPerConnected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CAPEX per Connected Home (R)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1500"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monthlyOpex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly OPEX (R)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Maintenance, power, backhaul costs</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paybackPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payback Period (months)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="30"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="securityRisk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security/Theft/Vandalism Risk</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - Secure area, good community watch</SelectItem>
                        <SelectItem value="medium">Medium - Some risk, mitigation possible</SelectItem>
                        <SelectItem value="high">High - Significant theft/vandalism risk</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Delivery & Operations</CardTitle>
              <CardDescription>Operational readiness and delivery capabilities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="localContractors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local Contractors</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contractor availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available - Proven local teams</SelectItem>
                          <SelectItem value="limited">Limited - Some capacity</SelectItem>
                          <SelectItem value="none">None - Need to import teams</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="installCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Installation Capacity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select install capacity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High - &gt;50 installs/month</SelectItem>
                          <SelectItem value="medium">Medium - 20-50 installs/month</SelectItem>
                          <SelectItem value="low">Low - &lt;20 installs/month</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional context, stage-gates, go/no-go triggers, or special considerations..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional: Include any other relevant details about the project</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );
        
      case 8:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Assessment Complete
              </CardTitle>
              <CardDescription>Your fibre feasibility assessment has been submitted and scored.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{score}/100</div>
                <div className="text-lg font-semibold">
                  Feasibility Score
                </div>
                <Badge 
                  variant={score && score >= 75 ? "default" : "destructive"}
                  className="mt-2"
                >
                  {score && score >= 75 ? "RECOMMENDED" : "NEEDS REVIEW"}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Our technical team will review your submission within 24 hours</li>
                  <li>• You'll receive a detailed feasibility report via email</li>
                  <li>• We'll schedule a consultation call to discuss next steps</li>
                  <li>• If viable, we'll prepare a formal build proposal</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => navigate("/projects")} variant="outline">
                  View Other Projects
                </Button>
                <Button onClick={() => navigate("/contact")}>
                  Contact Us Directly
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Fibre Feasibility Assessment
            </h1>
            <p className="text-muted-foreground">
              Complete this comprehensive assessment to evaluate the viability of fibre build in your community
            </p>
          </div>

          {/* Progress */}
          {currentStep <= totalSteps && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStep()}
              
              {/* Navigation */}
              {currentStep <= totalSteps && (
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep === totalSteps ? (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Assessment
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button type="button" onClick={nextStep}>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FibreFeasibilityForm;