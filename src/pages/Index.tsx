import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhySiyakha from "@/components/WhySiyakha";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import Testimonials from "@/components/Testimonials";
import LeadMagnet from "@/components/LeadMagnet";
import BlogPreview from "@/components/BlogPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <WhySiyakha />
      <Services />
      <Projects />
      <Testimonials />
      <LeadMagnet />
      <BlogPreview />
      <Footer />
    </div>
  );
};

export default Index;
