import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, Lightbulb, Plug, Wifi, ThermometerSun, Shield, Router, Signal, Smartphone, Lock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const smartFeatures = [
  { icon: Lightbulb, title: "Smart Lighting", desc: "TP-Link Tapo smart bulbs with colour control, scheduling, and voice assistant integration." },
  { icon: Plug, title: "Smart Plugs", desc: "TP-Link Tapo smart plugs with energy monitoring — control any appliance remotely." },
  { icon: Wifi, title: "Smart Wi-Fi (Mesh)", desc: "TP-Link Deco mesh systems for seamless whole-home coverage with zero dead spots." },
  { icon: ThermometerSun, title: "Climate Control", desc: "Smart thermostats and IR blasters to automate air conditioning and heating." },
  { icon: Shield, title: "Smart Security", desc: "Tapo cameras, smart doorbells, and motion sensors for 24/7 peace of mind." },
  { icon: Home, title: "Home Automation", desc: "Centralised control of all devices from one app — lights, plugs, cameras, and more." },
];

const wifiSolutions = [
  {
    icon: Router,
    title: "TP-Link Deco BE65 (Wi-Fi 7)",
    desc: "Next-gen tri-band mesh system delivering up to 18 Gbps. Perfect for smart homes with many connected devices.",
    image: "/lovable-uploads/deco-be65-3pack.png",
  },
  {
    icon: Signal,
    title: "Grandstream GWN Wi-Fi 7 APs",
    desc: "Enterprise-grade access points we deploy in hospitality and residential spaces for rock-solid coverage.",
    image: "/lovable-uploads/gwn-wifi7-front.png",
  },
  {
    icon: Smartphone,
    title: "TP-Link Tapo Smart Home Kit",
    desc: "Smart bulbs, plugs, cameras, and robot vacuums — all managed from the Tapo app ecosystem.",
    image: "/lovable-uploads/tapo-c660-product.png",
  },
];

const smartTools = [
  { icon: Camera, title: "Tapo C460 / C660 Cameras", desc: "AI-powered indoor/outdoor cameras with person detection, night vision, and cloud playback." },
  { icon: Lock, title: "Smart Doorbell (Tapo D235)", desc: "Video doorbell with two-way audio, motion zones, and smartphone notifications." },
  { icon: Lightbulb, title: "Tapo L530E Smart Bulbs", desc: "Multicolour LED bulbs with 16 million colours, schedules, and energy saving modes." },
  { icon: Zap, title: "Tapo RV30 Max Robot Vacuum", desc: "LiDAR navigation robot vacuum and mop — smart cleaning on autopilot." },
  { icon: Router, title: "TP-Link Deco Mesh Systems", desc: "Whole-home Wi-Fi mesh with parental controls, QoS, and IoT device management." },
  { icon: Signal, title: "Grandstream GWN APs", desc: "Commercial-grade Wi-Fi 6/7 access points for high-density smart environments." },
];

const Property = () => {
  useEffect(() => {
    document.title = "Siyakha Property | Smart Home & Wi-Fi Solutions";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Siyakha Property – our Airbnb portfolio where we deploy and test smart Wi-Fi, smart plugs, smart lights, cameras, and residential IoT solutions in Sandton.");
  }, []);

  useEffect(() => {
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
            Our Airbnb portfolio is a real-world testing ground for smart home technology — Wi-Fi mesh systems, smart plugs, smart lights, cameras, and more. Every solution we recommend, we use ourselves first.
          </p>
        </div>
      </section>

      {/* Smart Home Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-3">
            Smart Home Tech We Deploy &amp; Test
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            Every device in our properties is hand-picked and field-tested by our team.
          </p>
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

      {/* Wi-Fi Solutions */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-3">
            Our Wi-Fi &amp; Networking Solutions
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            The same enterprise-grade Wi-Fi we deploy for businesses — tested in our own properties.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {wifiSolutions.map((s) => (
              <Card key={s.title} className="border-border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-muted flex items-center justify-center p-4">
                  <img src={s.image} alt={s.title} className="max-h-full object-contain" loading="lazy" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/products">
              <Button variant="outline">Browse All Products →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Smart Tools Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-3">
            Smart Tools We Use
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            From cameras to robot vacuums — the full smart home toolkit deployed across our properties.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {smartTools.map((t) => (
              <div key={t.title} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex-shrink-0 flex items-center justify-center">
                  <t.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{t.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Airbnb Portfolio */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Our Airbnb Portfolio</h2>
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
                  className="inline-block mt-3"
                >
                  <Button variant="default" size="sm">Click Here to Book It Online →</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Want Smart Home Solutions for Your Space?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Whether it's an Airbnb, rental property, or your own home — we can deploy the same smart tech we use daily.
          </p>
          <Link to="/contact">
            <Button size="lg">Get in Touch</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Property;
