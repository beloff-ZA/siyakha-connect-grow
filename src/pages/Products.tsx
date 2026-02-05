import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ShoppingCart, Sun, Wifi, Camera, Eye, Shield, Smartphone, Volume2, HardDrive, Battery, Check, MessageCircle } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const PAGE_URL = "/products";
const TITLE = "Security Products & Equipment | Siyakha Technology";
const DESCRIPTION = "Shop premium security cameras, networking equipment and IT hardware. TP-Link Tapo, Grandstream and more with professional installation available.";

const products = [
  {
    id: "tp-tapo-c660-kit",
    name: "TP-Link Tapo C660 Solar-Powered Pan/Tilt Security Camera Kit",
    sku: "TP-TAPO-C660-KIT",
    price: 2875,
    image: "/lovable-uploads/tapo-c660-product.png",
    boxImage: "/lovable-uploads/tapo-c660-box.png",
    description: "The Tapo C660 delivers 4K 8MP ultra-clear video with 18× digital zoom and full 360° pan/tilt coverage, ensuring no detail is missed. Built-in AI smart detection accurately identifies people, pets, and vehicles, reducing false alerts.",
    features: [
      { icon: Camera, text: "4K 8MP Ultra-Clear Video" },
      { icon: Eye, text: "360° Pan/Tilt Coverage" },
      { icon: Sun, text: "Solar-Powered Operation" },
      { icon: Shield, text: "AI Smart Detection" },
      { icon: Wifi, text: "Dual-Band Wi-Fi (2.4/5GHz)" },
      { icon: Smartphone, text: "Tapo App Control" },
    ],
    highlights: [
      "18× digital zoom for detailed monitoring",
      "Starlight color night vision with F1.6 lens",
      "Built-in spotlights for vivid low-light imaging",
      "Maintenance-free solar power for off-grid locations",
      "Free Person/Pet/Vehicle detection",
      "Privacy mode & encrypted local storage",
    ],
    category: "Security Cameras",
    brand: "TP-Link",
    warranty: "2 Year",
    inStock: true,
  },
  {
    id: "tp-tapo-c460-kit",
    name: "TP-Link Tapo 4K 8MP Solar Security Camera Kit | C460",
    sku: "TP-TAPO-C460-KIT",
    manufacturerSku: "Tapo C460 KIT",
    price: 2548.79,
    image: "/lovable-uploads/tapo-c460-product.png",
    boxImage: "/lovable-uploads/tapo-c460-mounted.png",
    description: "The TP-Link Tapo C460 is a 4K 8MP solar-powered security camera kit designed for outdoor surveillance. It provides ultra-high-definition video and includes a solar panel and high-capacity battery for continuous, maintenance-free operation.",
    features: [
      { icon: Camera, text: "4K 8MP Ultra HD Video" },
      { icon: Sun, text: "Solar Panel Included" },
      { icon: Battery, text: "High-Capacity Battery" },
      { icon: Shield, text: "Smart Motion Detection" },
      { icon: Volume2, text: "Two-Way Audio" },
      { icon: HardDrive, text: "Local/Cloud Storage" },
    ],
    highlights: [
      "Full-colour night vision day and night",
      "Intelligent motion detection for people, vehicles and pets",
      "Two-way audio communication",
      "Smart notifications to your device",
      "Local or cloud storage options",
      "Tapo app for remote viewing and control",
    ],
    category: "Security Cameras",
    brand: "TP-Link",
    warranty: "2 Year",
    inStock: true,
  },
];

const Products = () => {
  useEffect(() => {
    document.title = TITLE;

    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(key, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    ensureMeta("name", "description", DESCRIPTION);
    ensureMeta("property", "og:title", TITLE);
    ensureMeta("property", "og:description", DESCRIPTION);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}${PAGE_URL}`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}${PAGE_URL}`);
  }, []);

  const breadcrumbJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${window.location.origin}/` },
      { "@type": "ListItem", position: 2, name: "Products", item: `${window.location.origin}${PAGE_URL}` },
    ],
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 lg:px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-muted-foreground">Products</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Hero Section */}
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Products</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl">
              Premium security cameras, networking equipment and IT hardware. All products include VAT and professional installation is available on request.
            </p>
          </div>
        </section>

        {/* Products */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="space-y-16">
              {products.map((product, index) => (
                <article 
                  key={product.id} 
                  className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-start ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                >
                  {/* Product Images Gallery */}
                  <div className={`space-y-4 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    {/* Main Product Image */}
                    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-secondary/80 to-muted border border-border">
                      <AspectRatio ratio={4/3}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                        />
                      </AspectRatio>
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <Badge className="bg-primary text-primary-foreground shadow-lg">
                          {product.brand}
                        </Badge>
                        {product.inStock && (
                          <Badge className="bg-accent text-accent-foreground shadow-lg">
                            <Check className="w-3 h-3 mr-1" />
                            In Stock
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Secondary Image */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted to-secondary/50 border border-border">
                      <AspectRatio ratio={16/9}>
                        <img
                          src={product.boxImage}
                          alt={`${product.name} in use`}
                          className="w-full h-full object-contain p-4"
                        />
                      </AspectRatio>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    {/* Category & SKU */}
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline" className="rounded-full px-3 py-1">
                        {product.category}
                      </Badge>
                      <span className="text-muted-foreground">SKU: {product.sku}</span>
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary leading-tight">
                      {product.name}
                    </h2>
                    
                    {/* Price Block */}
                    <div className="flex items-baseline gap-3 pb-4 border-b border-border">
                      <span className="text-4xl md:text-5xl font-bold text-primary">
                        R{product.price.toLocaleString()}
                      </span>
                      <div className="flex flex-col text-sm text-muted-foreground">
                        <span>inc VAT</span>
                        <span>excl. installation</span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* Features Pills */}
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((feature, idx) => (
                        <div 
                          key={idx}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/80 rounded-full border border-border/50 text-sm font-medium text-foreground"
                        >
                          <feature.icon className="w-4 h-4 text-accent" />
                          {feature.text}
                        </div>
                      ))}
                    </div>
                    
                    {/* Key Features List */}
                    <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
                      <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-accent" />
                        Key Features
                      </h3>
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {product.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Warranty Badge */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="font-medium text-primary">{product.warranty} Warranty</span>
                      </div>
                    </div>
                    
                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Link to="/contact#quote-form" className="flex-1">
                        <Button size="lg" className="w-full cta-primary text-base">
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Request Quote
                        </Button>
                      </Link>
                      <a
                        href={`https://wa.me/27815012993?text=Hi, I'm interested in the ${product.name} (${product.sku}) - R${product.price}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="lg" variant="outline" className="w-full text-base">
                          <MessageCircle className="w-5 h-5 mr-2" />
                          WhatsApp Enquiry
                        </Button>
                      </a>
                    </div>
                    
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Professional installation available • Contact us for bulk pricing
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Related Services CTA */}
        <section className="py-12 bg-secondary border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <h3 className="text-2xl font-bold text-primary mb-4">Need Professional Installation?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our team provides professional installation, configuration and ongoing support for all security equipment.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/services/security-and-surveillance">
                <Button variant="outline">Security Services</Button>
              </Link>
              <Link to="/contact#quote-form">
                <Button className="cta-primary">Get Installation Quote</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }} />
      {products.map((product) => (
        <script
          key={product.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              sku: product.sku,
              description: product.description,
              image: `${window.location.origin}${product.image}`,
              brand: { "@type": "Brand", name: product.brand },
              offers: {
                "@type": "Offer",
                price: product.price,
                priceCurrency: "ZAR",
                availability: product.inStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                seller: { "@type": "Organization", name: "Siyakha Technology" },
              },
            }),
          }}
        />
      ))}
    </div>
  );
};

export default Products;
