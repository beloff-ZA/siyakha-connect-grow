import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import TikTokLanding from "./pages/TikTokLanding";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import BlogIndex from "./pages/BlogIndex";
import LogIt from "./pages/LogIt";
import PortalTickets from "./pages/PortalTickets";
import TicketsList from "./pages/TicketsList";
import TicketDetail from "./pages/TicketDetail";
import AuthPage from "./pages/Auth";
import SmartEstates from "./pages/SmartEstates";

// Services
import InfrastructureAndNetworking from "./pages/services/InfrastructureAndNetworking";
import SecurityAndSurveillance from "./pages/services/SecurityAndSurveillance";
import CloudAndEdgeSolutions from "./pages/services/CloudAndEdgeSolutions";
import SmartCollaborationTools from "./pages/services/SmartCollaborationTools";
import NationalFieldSupport from "./pages/services/NationalFieldSupport";
import CutoversSimReplacements from "./pages/services/CutoversSimReplacements";
import HealthcareItSupport from "./pages/services/HealthcareItSupport";
import FieldSupportServices from "./pages/services/FieldSupportServices";
import RemoteITSupport from "./pages/services/RemoteITSupport";
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
import DRaaS from "./pages/blog/DRaaS";
// Legal and misc
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
import ItCompanySandton from "./pages/ItCompanySandton";
// Regional/City pages
import ItCompanyEMEA from "./pages/ItCompanyEMEA";
import ItCompanyCapeTown from "./pages/ItCompanyCapeTown";
import ItCompanyLondon from "./pages/ItCompanyLondon";
import ItCompanyAngola from "./pages/ItCompanyAngola";
// Education
import SchoolItSupport from "./pages/services/SchoolItSupport";
import EducationItServices from "./pages/services/EducationItServices";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientPortal from "./pages/ClientPortal";
import Contact from "./pages/Contact";
import GiveBack from "./pages/GiveBack";

import WebsiteOrder from "./pages/WebsiteOrder";
import GiveBackButton from "./components/GiveBackButton";

// Director PA pages
import AdminRoute from "./components/helpdesk/AdminRoute";
import HelpdeskDashboard from "./pages/helpdesk/Dashboard";
import HelpdeskDiary from "./pages/helpdesk/Diary";
import HelpdeskCalendar from "./pages/helpdesk/DirectorCalendar";
import DirectorPA from "./pages/helpdesk/DirectorPA";
import DirectorProjects from "./pages/helpdesk/DirectorProjects";
import DirectorCosts from "./pages/helpdesk/DirectorCosts";
import HelpdeskLeads from "./pages/helpdesk/Leads";
import DirectorInbox from "./pages/helpdesk/DirectorInbox";
import DirectorNotes from "./pages/helpdesk/DirectorNotes";
import FutureProjects from "./pages/helpdesk/FutureProjects";
import SitePerformancePage from "./pages/helpdesk/SitePerformance";
import CustomersPage from "./pages/helpdesk/Customers";
import SuppliersPage from "./pages/helpdesk/Suppliers";
import InternetProvidersPage from "./pages/helpdesk/InternetProviders";
import VoipProvidersPage from "./pages/helpdesk/VoipProviders";
import PackagesPage from "./pages/helpdesk/Packages";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
          <AuthProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/smart-estates" element={<SmartEstates />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Navigate to="/" replace />} />
                <Route path="/products" element={<Navigate to="/" replace />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/careers" element={<Navigate to="/" replace />} />
                <Route path="/give-back" element={<GiveBack />} />
                <Route path="/property" element={<Navigate to="/" replace />} />
                <Route path="/website-order" element={<WebsiteOrder />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                
                <Route path="/log-it" element={<LogIt />} />
                <Route path="/portal" element={<Navigate to="/helpdesk" replace />} />
                <Route path="/portal/tickets" element={<Navigate to="/helpdesk" replace />} />
                <Route path="/portal/my-tickets" element={<Navigate to="/helpdesk" replace />} />
                <Route path="/portal/tickets/:id" element={<Navigate to="/helpdesk" replace />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/need-help" element={<Navigate to="/log-it" replace />} />
                <Route path="/company" element={<Navigate to="/" replace />} />
                <Route path="/log-a-call" element={<Navigate to="/log-it" replace />} />
                <Route path="/support-deals" element={<SupportDeals />} />

                {/* Director PA */}
                <Route path="/helpdesk" element={<AdminRoute><HelpdeskDashboard /></AdminRoute>} />
                <Route path="/helpdesk/diary" element={<AdminRoute><HelpdeskDiary /></AdminRoute>} />
                <Route path="/helpdesk/calendar" element={<AdminRoute><HelpdeskCalendar /></AdminRoute>} />
                <Route path="/helpdesk/projects" element={<AdminRoute><DirectorProjects /></AdminRoute>} />
                <Route path="/helpdesk/costs" element={<AdminRoute><DirectorCosts /></AdminRoute>} />
                <Route path="/helpdesk/ai-pa" element={<AdminRoute><DirectorPA /></AdminRoute>} />
                <Route path="/helpdesk/leads" element={<AdminRoute><HelpdeskLeads /></AdminRoute>} />
                <Route path="/helpdesk/inbox" element={<AdminRoute><DirectorInbox /></AdminRoute>} />
                <Route path="/helpdesk/notes" element={<AdminRoute><DirectorNotes /></AdminRoute>} />
                <Route path="/helpdesk/future-projects" element={<AdminRoute><FutureProjects /></AdminRoute>} />
                <Route path="/helpdesk/site-performance" element={<AdminRoute><SitePerformancePage /></AdminRoute>} />
                <Route path="/helpdesk/customers" element={<AdminRoute><CustomersPage /></AdminRoute>} />
                <Route path="/helpdesk/suppliers" element={<AdminRoute><SuppliersPage /></AdminRoute>} />
                <Route path="/helpdesk/internet-providers" element={<AdminRoute><InternetProvidersPage /></AdminRoute>} />
                <Route path="/helpdesk/voip-providers" element={<AdminRoute><VoipProvidersPage /></AdminRoute>} />
                <Route path="/helpdesk/packages" element={<AdminRoute><PackagesPage /></AdminRoute>} />

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
                <Route path="/services/field-support-services" element={<FieldSupportServices />} />
                <Route path="/services/remote-it-support" element={<RemoteITSupport />} />
                <Route path="/remote-it-support" element={<Navigate to="/services/remote-it-support" replace />} />
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
                <Route path="/blog/draas" element={<DRaaS />} />


                <Route path="/it-company-johannesburg" element={<ItCompanyJohannesburg />} />
                <Route path="/it-company-sandton" element={<ItCompanySandton />} />
                <Route path="/managed-it-services-johannesburg" element={<ManagedITSJohannesburg />} />
                <Route path="/it-support-johannesburg" element={<ITSupportJohannesburg />} />
                <Route path="/cybersecurity-services-johannesburg" element={<CybersecurityJohannesburg />} />
                <Route path="/cloud-services-johannesburg" element={<CloudServicesJohannesburg />} />
                <Route path="/it-company-emea" element={<ItCompanyEMEA />} />
                <Route path="/it-company-cape-town" element={<ItCompanyCapeTown />} />
                <Route path="/it-company-london" element={<ItCompanyLondon />} />
                <Route path="/it-company-angola" element={<ItCompanyAngola />} />

                {/* Education IT */}
                <Route path="/services/school-it-support" element={<SchoolItSupport />} />
                <Route path="/services/education-it-services" element={<EducationItServices />} />
                <Route path="/school-it-support" element={<Navigate to="/services/school-it-support" replace />} />
                <Route path="/education-it" element={<Navigate to="/services/education-it-services" replace />} />
                <Route path="/get-started" element={<TikTokLanding />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              <WhatsAppContact />
              <GiveBackButton />
              
            </Router>
          </AuthProvider>
        
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;