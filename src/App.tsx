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
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/contact" element={<Contact />} />
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
