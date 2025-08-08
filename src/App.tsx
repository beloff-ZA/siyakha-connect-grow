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
// Blog articles
import SchoolNetworkUpgrade from "./pages/blog/SchoolNetworkUpgrade";
import ManagedITMSP from "./pages/blog/ManagedITMSP";
import ReplaceWifiSystem from "./pages/blog/ReplaceWifiSystem";
import PowerOfAI from "./pages/blog/PowerOfAI";
import HardwareUpgrade from "./pages/blog/HardwareUpgrade";
import CyberVulnerabilities from "./pages/blog/CyberVulnerabilities";
import NComputing from "./pages/blog/NComputing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<ProjectsIndex />} />
          <Route path="/contact" element={<Contact />} />

          {/* Services */}
          <Route path="/services/infrastructure-and-networking" element={<InfrastructureAndNetworking />} />
          <Route path="/services/infrastructure-networking" element={<Navigate to="/services/infrastructure-and-networking" replace />} />
          <Route path="/services/security-and-surveillance" element={<SecurityAndSurveillance />} />
          <Route path="/services/security-surveillance" element={<Navigate to="/services/security-and-surveillance" replace />} />
          <Route path="/services/cloud-and-edge-solutions" element={<CloudAndEdgeSolutions />} />
          <Route path="/services/cloud-edge-solutions" element={<Navigate to="/services/cloud-and-edge-solutions" replace />} />
          <Route path="/services/smart-collaboration-tools" element={<SmartCollaborationTools />} />

          {/* Blog */}
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/understanding-the-power-of-ai-in-modern-business-and-education" element={<PowerOfAI />} />
          <Route path="/blog/5-signs-your-school-needs-a-network-upgrade" element={<SchoolNetworkUpgrade />} />
          <Route path="/blog/why-every-growing-business-should-consider-a-managed-it-service-provider-msp" element={<ManagedITMSP />} />
          <Route path="/blog/how-to-know-when-its-time-to-replace-your-wi-fi-system" element={<ReplaceWifiSystem />} />
          <Route path="/blog/why-you-need-to-upgrade-your-hardware-before-it-slows-you-down" element={<HardwareUpgrade />} />
          <Route path="/blog/understanding-cyber-vulnerabilities-and-how-to-protect-your-business" element={<CyberVulnerabilities />} />
          <Route path="/blog/ncomputing-the-smart-affordable-solution-for-schools" element={<NComputing />} />

          {/* Projects */}
          <Route path="/projects/marist-brothers-linmeyer" element={<MaristBrothersProject />} />
          <Route path="/projects/kfc-national-network-rollout" element={<KFCExmileProject />} />
          <Route path="/projects/pelican-club-bahrain" element={<PelicanClubBahrainProject />} />
          <Route path="/projects/campuskey-network-overhaul" element={<CampusKeyProject />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
