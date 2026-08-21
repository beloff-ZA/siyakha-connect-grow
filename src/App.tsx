import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import RegionalServices from "./pages/RegionalServices";
import PartnerEngineers from "./pages/PartnerEngineers";
import ManagedIT from "./pages/ManagedIT";
import CaseStudy from "./pages/CaseStudy";
import SecuritySurveillance from "./pages/SecuritySurveillance";
import Schools from "./pages/Schools";
import CloudNetworking from "./pages/CloudNetworking";
import About from "./pages/About";
import AudiencePage from "./pages/AudiencePage";
import CapabilityPage from "./pages/CapabilityPage";
import Projects from "./pages/Projects";
import BrandWifi from "./pages/BrandWifi";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import Shop from "./pages/shop/Shop";
import ProductDetail from "./pages/shop/ProductDetail";
import QuoteRequest from "./pages/shop/QuoteRequest";
import { useCartSync } from "./hooks/useCartSync";

// Director PA / Helpdesk (protected backend — preserved)
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
import ClientPortalAdmin from "./pages/helpdesk/ClientPortalAdmin";

// Client Portal
import ClientLogin from "./pages/ClientLogin";
import ClientRoute from "./components/portal/ClientRoute";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalProject from "./pages/portal/PortalProject";
import PortalTracker from "./pages/portal/PortalTracker";
import PortalDocuments from "./pages/portal/PortalDocuments";
import PortalGallery from "./pages/portal/PortalGallery";
import PortalUpdates from "./pages/portal/PortalUpdates";
import PortalSupport from "./pages/portal/PortalSupport";
import PortalProfile from "./pages/portal/PortalProfile";

const queryClient = new QueryClient();

function CartSyncMount() {
  useCartSync();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <CartSyncMount />
            <Routes>
              {/* Single public page */}
              <Route path="/" element={<Index />} />

              {/* Auth (required for backend access) */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Client portal */}
              <Route path="/client-login" element={<ClientLogin />} />
              <Route path="/portal" element={<ClientRoute><PortalDashboard /></ClientRoute>} />
              <Route path="/portal/project" element={<ClientRoute><PortalProject /></ClientRoute>} />
              <Route path="/portal/tracker" element={<ClientRoute><PortalTracker /></ClientRoute>} />
              <Route path="/portal/documents" element={<ClientRoute><PortalDocuments /></ClientRoute>} />
              <Route path="/portal/gallery" element={<ClientRoute><PortalGallery /></ClientRoute>} />
              <Route path="/portal/updates" element={<ClientRoute><PortalUpdates /></ClientRoute>} />
              <Route path="/portal/support" element={<ClientRoute><PortalSupport /></ClientRoute>} />
              <Route path="/portal/profile" element={<ClientRoute><PortalProfile /></ClientRoute>} />


              {/* Shop */}
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/quote" element={<QuoteRequest />} />
              <Route path="/shop/:handle" element={<ProductDetail />} />

              {/* Regional services — Africa web design & development */}
              <Route path="/regional-services" element={<RegionalServices />} />

              {/* Partner engineer registration */}
              <Route path="/partner-engineers" element={<PartnerEngineers />} />

              {/* Managed IT Services */}
              <Route path="/managed-it" element={<ManagedIT />} />
              <Route path="/security-surveillance" element={<SecuritySurveillance />} />
              <Route path="/schools" element={<Schools />} />
              <Route path="/cloud-networking" element={<CloudNetworking />} />
              <Route path="/about" element={<About />} />
              <Route path="/brand-wifi" element={<BrandWifi />} />

              {/* Who we serve */}
              <Route path="/who-we-serve/:slug" element={<AudiencePage />} />

              {/* Capability pages */}
              <Route path="/capabilities/:slug" element={<CapabilityPage />} />

              {/* All projects */}
              <Route path="/projects" element={<Projects />} />

              {/* Case studies */}
              <Route path="/case-studies/:slug" element={<CaseStudy />} />

              {/* Director PA / Helpdesk — protected backend */}
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
              <Route path="/helpdesk/client-portal" element={<AdminRoute><ClientPortalAdmin /></AdminRoute>} />

              {/* Everything else redirects home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
