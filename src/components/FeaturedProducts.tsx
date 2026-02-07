import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package, Wrench, ShoppingBag, Star, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "@/components/products/ProductsData";

// Featured product IDs to display on homepage
const featuredProductIds = [
  "tp-tapo-c660-kit",
  "gs-gwn7672",
  "tp-decobe65-3p",
  "gs-gwn7816p",
];

const FeaturedProducts = () => {
  const featuredProducts = products.filter(p => featuredProductIds.includes(p.id));

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-accent border-accent/30 bg-accent/5">
            <Package className="w-4 h-4 mr-2" />
            Hardware + Installation
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Featured Products with{" "}
            <span className="text-accent">Professional Installation</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Unlike conventional stores, we don't just sell hardware — we supply, install, configure and support it. 
            Get a complete solution quote with professional installation included.
          </p>
        </div>

        {/* Value Proposition */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="p-1.5 bg-accent/10 rounded-full">
              <Check className="w-4 h-4 text-accent" />
            </div>
            Supply & Delivery
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="p-1.5 bg-accent/10 rounded-full">
              <Check className="w-4 h-4 text-accent" />
            </div>
            Professional Installation
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="p-1.5 bg-accent/10 rounded-full">
              <Check className="w-4 h-4 text-accent" />
            </div>
            Configuration & Setup
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="p-1.5 bg-accent/10 rounded-full">
              <Check className="w-4 h-4 text-accent" />
            </div>
            Ongoing Support
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="group overflow-hidden border-border/50 hover:border-accent/50 hover:shadow-xl transition-all duration-300 bg-card"
            >
              <div className="relative aspect-square p-4 bg-gradient-to-br from-secondary/50 to-background">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {product.inStock && (
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs">
                    In Stock
                  </Badge>
                )}
                <Badge 
                  variant="secondary" 
                  className="absolute top-3 right-3 bg-accent/10 text-accent border-accent/20 text-xs"
                >
                  <Wrench className="w-3 h-3 mr-1" />
                  Install Available
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 mb-2">
                {product.rating && (
                    <>
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                <h3 className="font-semibold text-foreground line-clamp-2 text-sm mb-3 min-h-[2.5rem]">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-bold text-primary">
                    R{product.price.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-muted-foreground">inc VAT</span>
                </div>
                <Link to={`/products?highlight=${product.id}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors"
                  >
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 rounded-2xl p-8 border border-border/50">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingBag className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-bold text-primary">We Do It All</h3>
          </div>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Browse our full product catalog and get a quote that includes hardware, installation, and setup. 
            No separate contractors needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" className="cta-primary gap-2">
                Browse All Products
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/contact#quote-form">
              <Button size="lg" variant="outline" className="gap-2">
                Request Installation Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
