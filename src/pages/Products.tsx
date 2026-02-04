import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ShoppingCart, Sun, Wifi, Camera, Eye, Shield, Smartphone } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

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

        {/* Products Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden border-border mb-8">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Product Images */}
                  <div className="bg-secondary p-8 flex flex-col items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full max-w-sm h-auto object-contain mb-6"
                    />
                    <img
                      src={product.boxImage}
                      alt={`${product.name} packaging`}
                      className="w-full max-w-xs h-auto object-contain"
                    />
                  </div>

                  {/* Product Details */}
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">{product.category}</Badge>
                      <Badge variant="outline">{product.brand}</Badge>
                      {product.inStock && (
                        <Badge className="bg-accent text-accent-foreground">In Stock</Badge>
                      )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                      {product.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">SKU: {product.sku}</p>

                    <div className="mb-6">
                      <span className="text-3xl font-bold text-primary">
                        R{product.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground ml-2">inc VAT (without install)</span>
                    </div>

                    <p className="text-muted-foreground mb-6">{product.description}</p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      {product.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-secondary rounded-lg"
                        >
                          <feature.icon className="w-5 h-5 text-accent flex-shrink-0" />
                          <span className="text-sm font-medium text-foreground">{feature.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Highlights */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-primary mb-3">Key Features:</h3>
                      <ul className="space-y-2">
                        {product.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link to="/contact#quote-form" className="flex-1">
                        <Button className="w-full cta-primary">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Request Quote
                        </Button>
                      </Link>
                      <a
                        href={`https://wa.me/27815012993?text=Hi, I'm interested in the ${product.name} (${product.sku}) - R${product.price}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">
                          WhatsApp Enquiry
                        </Button>
                      </a>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground text-center">
                      Professional installation available • Contact us for bulk pricing
                    </p>
                  </CardContent>
                </div>
              </Card>
            ))}
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
