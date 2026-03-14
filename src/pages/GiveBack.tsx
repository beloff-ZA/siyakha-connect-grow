import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, ExternalLink, Droplets, Stethoscope, Home, Truck, GraduationCap, Flame, Globe, Users, Shield, HandHeart, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";

const impactAreas = [
  {
    icon: Droplets,
    title: "Water & Drought Relief",
    description:
      "Gift of the Givers has drilled over 340 boreholes across South Africa, providing clean drinking water to drought-stricken communities. Their rapid-response water tanker programme delivers millions of litres to areas facing critical shortages.",
  },
  {
    icon: Stethoscope,
    title: "Healthcare & Medical Aid",
    description:
      "From fully equipped field hospitals to medical supply deliveries, the organisation has provided healthcare interventions worth billions of rands. They supply hospitals with life-saving equipment, medication, and deploy volunteer medical professionals to underserved areas.",
  },
  {
    icon: Home,
    title: "Disaster Response & Rebuilding",
    description:
      "Whether floods in KwaZulu-Natal, earthquakes in Turkey and Syria, or fire-ravaged informal settlements — Gift of the Givers is consistently among the first responders, providing shelter kits, blankets, food parcels, and rebuilding infrastructure.",
  },
  {
    icon: Truck,
    title: "Food Security & Feeding Programmes",
    description:
      "The organisation distributes thousands of food parcels monthly to vulnerable communities, runs community kitchens, and supports feeding schemes at schools and shelters across South Africa and the continent.",
  },
  {
    icon: GraduationCap,
    title: "Education & Bursaries",
    description:
      "Gift of the Givers funds scholarships and bursaries for students who cannot afford tertiary education. They also supply schools with stationery, uniforms, and digital learning equipment to bridge the education gap.",
  },
  {
    icon: Flame,
    title: "Fire & Emergency Relief",
    description:
      "When devastating fires displace families — from Cape Town's informal settlements to the Parliament fire — the organisation provides immediate relief including cooked meals, clothing, hygiene products, and temporary shelter materials.",
  },
  {
    icon: Globe,
    title: "International Humanitarian Missions",
    description:
      "Operating in over 44 countries, Gift of the Givers has responded to crises in Syria, Palestine, Yemen, Somalia, Nepal, Haiti, and beyond — delivering aid regardless of race, religion, or political affiliation.",
  },
  {
    icon: Users,
    title: "Search & Rescue Operations",
    description:
      "The organisation maintains a professional search and rescue unit with trained divers, K9 units, and wilderness search teams that deploy across South Africa to assist in missing-person cases and natural disaster rescues.",
  },
  {
    icon: Shield,
    title: "Gender-Based Violence Support",
    description:
      "Gift of the Givers supports survivors of gender-based violence through counselling services, safe-house provisions, and the distribution of dignity packs containing essential personal care items.",
  },
];

const stats = [
  { value: "R4 Billion+", label: "In aid delivered worldwide" },
  { value: "44+", label: "Countries reached" },
  { value: "340+", label: "Boreholes drilled in SA" },
  { value: "30+", label: "Years of humanitarian service" },
];

const GiveBack = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Heart className="mx-auto h-14 w-14 mb-6 text-accent" />
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Give Back</h1>
          <p className="text-lg md:text-xl opacity-90">
            Siyakha Technology has a wide focus in its giving — mainly{" "}
            <strong>children, education, technology for children, skills development, poverty and feeding projects</strong>.
            We believe in empowering communities beyond technology, and we
            encourage direct donations to the causes that move you.
          </p>
        </div>
      </section>

      {/* About Gift of the Givers */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
            About Gift of the Givers
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <img
              src="/lovable-uploads/gift-of-givers-relief.png"
              alt="Gift of the Givers Foundation delivering relief supplies to communities"
              className="w-full rounded-xl shadow-md object-cover aspect-[4/3]"
              loading="lazy"
              decoding="async"
            />
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Founded in 1992 by <strong>Dr Imtiaz Sooliman</strong>, Gift of the
                Givers has grown into the largest disaster-response non-governmental
                organisation of African origin on the continent. What began as a
                single relief mission has evolved into a globally recognised
                humanitarian force that has delivered aid worth over{" "}
                <strong>R4&nbsp;billion</strong> across more than{" "}
                <strong>44&nbsp;countries</strong>.
              </p>
              <p>
                The organisation operates on a simple but powerful principle:{" "}
                <em>
                  "Best among people are those who benefit mankind."
                </em>{" "}
                Aid is delivered unconditionally, regardless of race,
                religion, culture, or political affiliation.
              </p>
              <p>
                They maintain one of the fastest response times of any
                humanitarian organisation in the world — deploying teams within
                hours with supplies, medical professionals, and infrastructure
                support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base opacity-80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects / Impact Areas */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
            Their Projects &amp; Impact Areas
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Gift of the Givers operates across multiple sectors to address
            South Africa's and the world's most pressing humanitarian needs.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {impactAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div
                  key={area.title}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      {area.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {area.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why We Give Back */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Why Giving Back Matters to Us
          </h2>
          <div className="text-muted-foreground space-y-4 text-left md:text-center">
            <p>
              At Siyakha Technology, we believe that building great technology
              infrastructure is only meaningful when we also build stronger
              communities. Our giving focuses on children, education, skills
              development, poverty alleviation, and feeding programmes.
            </p>
            <p>
              We admire organisations that operate with transparency,
              accountability, and an unconditional commitment to those in need.
              Below are some of the charities whose work we deeply respect.
            </p>
            <p>
              We encourage our clients, partners, and visitors to consider
              donating directly to these causes — no matter how small. Every
              rand makes a difference.
            </p>
          </div>
        </div>
      </section>

      {/* Community Events */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
            Facilities We Recommend Giving To
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            These are some of the charities we admire for the incredible work they do. We encourage you to learn more and consider donating directly.
          </p>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-[3/4] md:aspect-auto">
                <img
                  src="/lovable-uploads/wis-festival-poster.jpeg"
                  alt="Women-in-Sport Festival 2026 poster — Marist Brothers Linmeyer"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <span className="inline-block bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4 w-fit">
                  14–15 March 2026
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  Women-in-Sport Festival &amp; Sanitary Drive
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Marist Brothers Linmeyer, in partnership with Emeris and SOJO Helping Hands Foundation, hosted the annual <strong>Women-in-Sport Festival</strong> — a celebration of girls in sport combined with a community <strong>Sanitary Drive</strong> supporting dignity for young women.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Siyakha Technology was a proud sponsor of this event, reinforcing our commitment to empowering communities beyond technology. The festival brought together netball, soccer, and basketball athletes while collecting sanitary product donations for girls in need.
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="/lovable-uploads/wis-sanitary-drive.jpeg"
                    alt="Siyakha branded flags at the Sanitary Drive event"
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border border-border"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Hosted by</p>
                    <p>Marist Brothers Linmeyer</p>
                    <p className="mt-1 font-semibold text-foreground">Partners</p>
                    <p>Emeris · SOJO · Mall of the South</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Frederic Place */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg mt-12">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-[3/4] md:aspect-auto">
                <img
                  src="/lovable-uploads/frederic-place-westbury.png"
                  alt="Frederic Place Home for the Aged — brick building in Westbury, Johannesburg"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <span className="inline-block bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4 w-fit">
                  Elder Care · Registered NPO
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  Frederic Place — A Home Where Every Elder Is Family
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Since 1978, <strong>Frederic Place</strong> has been Johannesburg's sanctuary of compassion — offering 24/7 nursing care, community, and belonging to vulnerable older persons. Located in Coronationville, this registered Non-Profit Organisation cares for <strong>85 residents</strong>, including 20 in a specialised frail-care wing.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Residents receive three home-style meals daily, medication management, social enrichment programmes, pastoral support, and round-the-clock nursing supervision — ensuring that growing old never means growing alone.
                </p>
                <Button asChild size="sm" variant="outline" className="w-fit">
                  <a
                    href="https://www.fredericplace.org/donate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Support Frederic Place
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* New Jerusalem Children's Home */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg mt-12">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-[3/4] md:aspect-auto">
                <img
                  src="/lovable-uploads/new-jerusalem-childrens-home.png"
                  alt="New Jerusalem Children's Home — container-based facility in Southern Africa"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <span className="inline-block bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4 w-fit">
                  Children's Care · Education · NPO
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  New Jerusalem Children's Home — A Sustainable Future for Orphans
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  For over <strong>25 years</strong>, New Jerusalem Children's Home has championed the rights of abandoned, abused, traumatised, orphaned and vulnerable children across Southern Africa. The home currently caters for <strong>120 children</strong>, providing a safe, nurturing, spiritual and loving environment.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Beyond residential care, the organisation runs <strong>Lanto Montessori International Schools</strong>, a high school development programme, sports facilities, and feeding schemes — building hope and futures for vulnerable children through care, education, and community empowerment.
                </p>
                <Button asChild size="sm" variant="outline" className="w-fit">
                  <a
                    href="https://newjerusalemchildrenshome.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Support New Jerusalem
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <div className="flex items-center gap-3 mt-6">
                  <img src="/lovable-uploads/nj-food-parcels-1.png" alt="Food parcel donations for New Jerusalem Children's Home" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-border" loading="lazy" decoding="async" />
                  <img src="/lovable-uploads/nj-food-parcels-2.png" alt="Groceries and essentials donated to New Jerusalem" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-border" loading="lazy" decoding="async" />
                  <img src="/lovable-uploads/nj-food-parcels-3.png" alt="Cleaning supplies and food donated to New Jerusalem" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-border" loading="lazy" decoding="async" />
                </div>
              </div>
            </div>
          </div>

          {/* Bryanston Methodist Church */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg mt-12">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-[3/4] md:aspect-auto">
                <img
                  src="/lovable-uploads/bryanston-methodist-church.png"
                  alt="Bryanston Methodist Church, Johannesburg"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <span className="inline-block bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4 w-fit">
                  Faith-Based · Community Outreach
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  Bryanston Methodist Church — Compassion in Action
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  <strong>Bryanston Methodist Church (BMC)</strong> is a faith-based non-profit in Bryanston, Johannesburg, passionately proclaiming Christ for healing and renewal in the community. Beyond spiritual services, BMC runs <strong>feeding programmes, youth development initiatives, and seasonal charity projects</strong> that uplift vulnerable families and individuals.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Through volunteer-driven outreach — including food parcel distributions, Christmas giving campaigns, and children's and youth mentorship programmes — BMC provides safe spaces, dignity, and belonging to those facing poverty or social hardship across surrounding communities.
                </p>
                <Button asChild size="sm" variant="outline" className="w-fit">
                  <a
                    href="https://www.bryanston.church/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Bryanston Methodist
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donate CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Our Charity Focus — Gift of the Givers
          </h2>

          <img
            src="/images/gift-of-givers-qr.png"
            alt="Scan to pay – Gift of the Givers"
            className="mx-auto w-56 h-56 md:w-64 md:h-64 rounded-xl shadow-md mb-8"
          />

          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Scan the QR code above to make an instant donation via Masterpass,
            or click the button below to donate online. Every contribution —
            big or small — makes a difference.
          </p>

          <Button asChild size="lg" className="cta-primary text-base px-8">
            <a
              href="https://giftofthegivers.org/make-a-difference/donate-with-masterpass/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donate on Gift of the Givers
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>

          <p className="mt-10 text-sm text-muted-foreground">
            Siyakha Technology does not process or handle any donations. All
            funds go directly to{" "}
            <a
              href="https://giftofthegivers.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-accent hover:text-accent/80"
            >
              Gift&nbsp;of&nbsp;the&nbsp;Givers
            </a>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GiveBack;
