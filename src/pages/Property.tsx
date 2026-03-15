import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, Lightbulb, Plug, Wifi, ThermometerSun, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const smartFeatures = [
  { icon: Lightbulb, title: "Smart Lighting", desc: "Automated LED lighting with scheduling and remote control via app." },
  { icon: Plug, title: "Smart Plugs", desc: "Energy-monitoring plugs to control appliances remotely." },
  { icon: Wifi, title: "High-Speed Wi-Fi", desc: "Enterprise-grade mesh Wi-Fi throughout every unit." },
  { icon: ThermometerSun, title: "Climate Control", desc: "Smart thermostats for optimal guest comfort and energy savings." },
  { icon: Shield, title: "Smart Security", desc: "Keyless entry, smart locks, and surveillance integration." },
  { icon: Home, title: "Home Automation", desc: "Centralised control of lights, plugs, and devices from one app." },
];

const Property = () => {
  useEffect(() => {
    document.title = "Siyakha Property | Smart Home Airbnb Portfolio";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Siyakha Property – our Airbnb portfolio where we test and showcase smart home technology, smart plugs, smart lights, and residential solutions in Sandton.");
  }, []);

  useEffect(() => {
    // Load Airbnb embed script
    const script = document.createElement("script");
    script.src = "https://www.airbnb.co.za/embeddable/airbnb_jssdk";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">
            Siyakha Property Division
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Smart Living, <span className="text-primary">Tested &amp; Proven</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our Airbnb portfolio doubles as a real-world testing ground for smart home technology — smart plugs, smart lights, and integrated residential solutions.
          </p>
        </div>
      </section>

      {/* Smart Home Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">
            Smart Home Tech We Deploy &amp; Test
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {smartFeatures.map((f) => (
              <Card key={f.title} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Airbnb Portfolio */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Our Portfolio</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            Stay in one of our smart-enabled properties and experience the technology first-hand.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="rounded-xl overflow-hidden shadow-lg border border-border bg-card">
              <div
                className="airbnb-embed-frame"
                data-id="903701296297001350"
                data-view="home"
                data-hide-price="true"
                style={{ width: 450, height: 300 }}
              />
              <div className="p-4">
                <h3 className="font-semibold text-foreground">Condo in Sandton</h3>
                <p className="text-sm text-muted-foreground">★ 4.86 · 1 bedroom · 1 bed · 1 bath</p>
                <a
                  href="https://www.airbnb.com/rooms/903701296297001350?guests=1&adults=1&s=66&source=embed_widget"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
                >
                  View on Airbnb →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Property;
