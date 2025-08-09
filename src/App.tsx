import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import MaristBrothersProject from "./pages/projects/MaristBrothers";
import KFCExmileProject from "./pages/projects/KFCExmile";
import NotFound from "./pages/NotFound";
import MaristCapeTownProject from "./pages/projects/MaristCapeTown";
import PelicanClubBahrainProject from "./pages/projects/PelicanClubBahrain";
import CampusKeyProject from "./pages/projects/CampusKey";
import About from "./pages/About";
import ProjectsIndex from "./pages/ProjectsIndex";
import BlogIndex from "./pages/BlogIndex";
import Contact from "./pages/Contact";
// Services
import InfrastructureAndNetworking from "./pages/services/InfrastructureAndNetworking";
import SecurityAndSurveillance from "./pages/services/SecurityAndSurveillance";
import CloudAndEdgeSolutions from "./pages/services/CloudAndEdgeSolutions";
import SmartCollaborationTools from "./pages/services/SmartCollaborationTools";
import NationalFieldSupport from "./pages/services/NationalFieldSupport";
import CutoversSimReplacements from "./pages/services/CutoversSimReplacements";
import ServicesIndex from "./pages/ServicesIndex";
// Blog articles
import SchoolNetworkUpgrade from "./pages/blog/SchoolNetworkUpgrade";
import ManagedITMSP from "./pages/blog/ManagedITMSP";
import ReplaceWifiSystem from "./pages/blog/ReplaceWifiSystem";
import PowerOfAI from "./pages/blog/PowerOfAI";
import HardwareUpgrade from "./pages/blog/HardwareUpgrade";
import CyberVulnerabilities from "./pages/blog/CyberVulnerabilities";
import NComputing from "./pages/blog/NComputing";
import FieldSupportSmartHands from "./pages/blog/FieldSupportSmartHands";
// Legal and misc
import Careers from "./pages/Careers";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import LogACall from "./pages/LogACall";
import SupportDeals from "./pages/SupportDeals";
import WhatsAppContact from "./components/WhatsAppContact";
import ScrollToTop from "./components/ScrollToTop";
// Localized Johannesburg pages
import ItCompanyJohannesburg from "./pages/ItCompanyJohannesburg";
import ManagedITSJohannesburg from "./pages/ManagedITSJohannesburg";
import ITSupportJohannesburg from "./pages/ITSupportJohannesburg";
import CybersecurityJohannesburg from "./pages/CybersecurityJohannesburg";
import CloudServicesJohannesburg from "./pages/CloudServicesJohannesburg";
// Regional/City pages
import ItCompanyEMEA from "./pages/ItCompanyEMEA";
import ItCompanyCapeTown from "./pages/ItCompanyCapeTown";
import ItCompanyLondon from "./pages/ItCompanyLondon";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<ProjectsIndex />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/log-a-call" element={<LogACall />} />
          <Route path="/support-deals" element={<SupportDeals />} />

          {/* Services */}
          <Route path="/services/infrastructure-and-networking" element={<InfrastructureAndNetworking />} />
          <Route path="/services/infrastructure-networking" element={<Navigate to="/services/infrastructure-and-networking" replace />} />
          <Route path="/services/security-and-surveillance" element={<SecurityAndSurveillance />} />
          <Route path="/services/security-surveillance" element={<Navigate to="/services/security-and-surveillance" replace />} />
          <Route path="/services/cloud-and-edge-solutions" element={<CloudAndEdgeSolutions />} />
          <Route path="/services/cloud-edge-solutions" element={<Navigate to="/services/cloud-and-edge-solutions" replace />} />
          <Route path="/services/smart-collaboration-tools" element={<SmartCollaborationTools />} />
          <Route path="/services/national-field-support" element={<NationalFieldSupport />} />
          <Route path="/services/national-field-support/cutovers-and-sim-replacements" element={<CutoversSimReplacements />} />
          <Route path="/services" element={<ServicesIndex />} />

          {/* Blog */}
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/understanding-the-power-of-ai-in-modern-business-and-education" element={<PowerOfAI />} />
          <Route path="/blog/5-signs-your-school-needs-a-network-upgrade" element={<SchoolNetworkUpgrade />} />
          <Route path="/blog/why-every-growing-business-should-consider-a-managed-it-service-provider-msp" element={<ManagedITMSP />} />
          <Route path="/blog/how-to-know-when-its-time-to-replace-your-wi-fi-system" element={<ReplaceWifiSystem />} />
          <Route path="/blog/why-you-need-to-upgrade-your-hardware-before-it-slows-you-down" element={<HardwareUpgrade />} />
          <Route path="/blog/understanding-cyber-vulnerabilities-and-how-to-protect-your-business" element={<CyberVulnerabilities />} />
          <Route path="/blog/ncomputing-the-smart-affordable-solution-for-schools" element={<NComputing />} />
          <Route path="/blog/field-support-and-smart-hands-services-south-africa" element={<FieldSupportSmartHands />} />

          {/* Projects */}
          <Route path="/projects/marist-brothers-linmeyer" element={<MaristBrothersProject />} />
          <Route path="/projects/kfc-national-network-rollout" element={<KFCExmileProject />} />
          <Route path="/projects/pelican-club-bahrain" element={<PelicanClubBahrainProject />} />
          <Route path="/projects/campuskey-network-overhaul" element={<CampusKeyProject />} />

<Route path="/it-company-johannesburg" element={<ItCompanyJohannesburg />} />
<Route path="/managed-it-services-johannesburg" element={<ManagedITSJohannesburg />} />
<Route path="/it-support-johannesburg" element={<ITSupportJohannesburg />} />
<Route path="/cybersecurity-services-johannesburg" element={<CybersecurityJohannesburg />} />
<Route path="/cloud-services-johannesburg" element={<CloudServicesJohannesburg />} />
<Route path="/it-company-emea" element={<ItCompanyEMEA />} />
<Route path="/it-company-cape-town" element={<ItCompanyCapeTown />} />
<Route path="/it-company-london" element={<ItCompanyLondon />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <WhatsAppContact />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
