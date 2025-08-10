import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import LogIt from "./pages/LogIt";

// Services
import InfrastructureAndNetworking from "./pages/services/InfrastructureAndNetworking";
import SecurityAndSurveillance from "./pages/services/SecurityAndSurveillance";
import CloudAndEdgeSolutions from "./pages/services/CloudAndEdgeSolutions";
import SmartCollaborationTools from "./pages/services/SmartCollaborationTools";
import NationalFieldSupport from "./pages/services/NationalFieldSupport";
import CutoversSimReplacements from "./pages/services/CutoversSimReplacements";
import HealthcareItSupport from "./pages/services/HealthcareItSupport";
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
import ITMigration from "./pages/blog/ITMigration";
import VoIPRollout from "./pages/blog/VoIPRollout";
import FieldSupportComplete from "./pages/blog/FieldSupportComplete";
import ClassroomPlayback from "./pages/blog/ClassroomPlayback";
// Legal and misc
import Careers from "./pages/Careers";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

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
import ItCompanyAngola from "./pages/ItCompanyAngola";
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<ProjectsIndex />} />
              <Route path="/contact" element={<Navigate to="/" replace />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              
              <Route path="/log-it" element={<LogIt />} />
              <Route path="/need-help" element={<Navigate to="/log-it" replace />} />
              <Route path="/company" element={<Navigate to="/" replace />} />
              <Route path="/log-a-call" element={<Navigate to="/log-it" replace />} />
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
              <Route path="/services/healthcare-it-support" element={<HealthcareItSupport />} />
              <Route path="/healthcare-it-support" element={<Navigate to="/services/healthcare-it-support" replace />} />
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
              <Route path="/blog/it-migration-services-south-africa" element={<ITMigration />} />
              <Route path="/blog/voip-phone-rollout-services-south-africa" element={<VoIPRollout />} />
              <Route path="/blog/complete-field-support-solutions-on-site-remote-and-dedicated-engineers" element={<FieldSupportComplete />} />
              <Route path="/blog/classroom-playback-technology-zoom-ai-lesson-replay" element={<ClassroomPlayback />} />

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
              <Route path="/it-company-angola" element={<ItCompanyAngola />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <WhatsAppContact />
          </Router>
        
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
