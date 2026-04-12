import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield,
  Truck,
  Award,
  Headphones,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { storefrontApiRequest, STOREFRONT_QUERY, ShopifyProduct } from "@/lib/shopify";
import ShopifyProductCard from "@/components/shopify/ShopifyProductCard";

const PAGE_URL = "/products";
const TITLE = "Security Products & Equipment | Siyakha Technology";
const DESCRIPTION = "Shop premium security cameras, networking equipment and IT hardware. Professional installation available.";

const Products = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = TITLE;
    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(key, value); document.head.appendChild(tag); }
      tag.setAttribute("content", content);
    };
    ensureMeta("name", "description", DESCRIPTION);
    ensureMeta("property", "og:title", TITLE);
    ensureMeta("property", "og:description", DESCRIPTION);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}${PAGE_URL}`);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 50 });
        setProducts(data?.data?.products?.edges || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 lg:px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><span className="text-muted-foreground">Products</span></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-y border-border">
          <div className="container mx-auto px-4 lg:px-6 py-8 md:py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-accent mb-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Shop with Confidence</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
                  Security Products
                </h1>
                <p className="mt-3 text-muted-foreground max-w-2xl text-lg">
                  Premium security cameras, networking equipment and IT hardware.
                  All products include VAT with professional installation available.
                </p>
              </div>
              <Link to="/contact#quote-form">
                <Button size="lg" className="cta-primary gap-2">
                  Request Bulk Quote
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="border-b border-border bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Truck, title: "Free Delivery", desc: "Orders over R5000" },
                { icon: Shield, title: "2 Year Warranty", desc: "On all products" },
                { icon: Award, title: "Genuine Products", desc: "Authorized dealer" },
                { icon: Headphones, title: "Expert Support", desc: "Professional installation" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-accent/10 rounded-lg"><Icon className="w-5 h-5 text-accent" /></div>
                  <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 lg:px-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-secondary/20 rounded-xl border border-border/50">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Products will appear here once they are added to the store.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ShopifyProductCard key={product.node.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-gradient-to-br from-primary/5 via-secondary to-accent/5 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Need Professional Installation?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
              Our certified technicians provide professional installation, configuration and ongoing support.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/services/security-and-surveillance">
                <Button variant="outline" size="lg" className="gap-2"><Shield className="w-4 h-4" />Security Services</Button>
              </Link>
              <Link to="/contact#quote-form">
                <Button size="lg" className="cta-primary gap-2">Get Installation Quote<ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
