import { useEffect, useMemo, useState } from "react";
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
  ArrowRight
} from "lucide-react";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import ProductCard from "@/components/products/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import { products, getCategories, getBrands } from "@/components/products/ProductsData";

const PAGE_URL = "/products";
const TITLE = "Security Products & Equipment | Siyakha Technology";
const DESCRIPTION = "Shop premium security cameras, networking equipment and IT hardware. TP-Link Tapo, Grandstream and more with professional installation available.";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

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

  const categories = useMemo(() => getCategories(), []);
  const brands = useMemo(() => getBrands(), []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply filters
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (selectedBrand) {
      result = result.filter(p => p.brand === selectedBrand);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        result.reverse();
        break;
      default:
        // Featured - keep original order
        break;
    }

    return result;
  }, [selectedCategory, selectedBrand, sortBy, searchQuery]);

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
        {/* Breadcrumb */}
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

        {/* Hero Section - Amazon Style */}
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

        {/* Trust Badges - Amazon Style */}
        <section className="border-b border-border bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Truck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Free Delivery</p>
                  <p className="text-xs text-muted-foreground">Orders over R5000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">2 Year Warranty</p>
                  <p className="text-xs text-muted-foreground">On all products</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Award className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Genuine Products</p>
                  <p className="text-xs text-muted-foreground">Authorized dealer</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Headphones className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Expert Support</p>
                  <p className="text-xs text-muted-foreground">Professional installation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 lg:px-6">
            {/* Filters */}
            <ProductFilters
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              sortBy={sortBy}
              viewMode={viewMode}
              searchQuery={searchQuery}
              onCategoryChange={setSelectedCategory}
              onBrandChange={setSelectedBrand}
              onSortChange={setSortBy}
              onViewModeChange={setViewMode}
              onSearchChange={setSearchQuery}
              productCount={filteredProducts.length}
            />

            {/* Product Grid/List */}
            <div className="mt-8">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-secondary/20 rounded-xl border border-border/50">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedBrand(null);
                      setSearchQuery("");
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode="grid" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode="list" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Services CTA */}
        <section className="py-12 bg-gradient-to-br from-primary/5 via-secondary to-accent/5 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Need Professional Installation?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
              Our certified technicians provide professional installation, configuration and ongoing support for all security equipment.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/services/security-and-surveillance">
                <Button variant="outline" size="lg" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Security Services
                </Button>
              </Link>
              <Link to="/contact#quote-form">
                <Button size="lg" className="cta-primary gap-2">
                  Get Installation Quote
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Structured Data */}
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
              aggregateRating: product.rating ? {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.reviewCount || 10,
              } : undefined,
            }),
          }}
        />
      ))}
    </div>
  );
};

export default Products;
