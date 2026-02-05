import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Check, 
  MessageCircle,
  Eye,
  Truck
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export interface ProductFeature {
  icon: React.ElementType;
  text: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  manufacturerSku?: string;
  price: number;
  originalPrice?: number;
  image: string;
  boxImage?: string;
  description: string;
  features: ProductFeature[];
  highlights: string[];
  category: string;
  brand: string;
  warranty: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

const ProductCard = ({ product, viewMode = "grid" }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 12;

  if (viewMode === "list") {
    return (
      <Card className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative w-full md:w-64 lg:w-80 flex-shrink-0 bg-gradient-to-br from-secondary via-muted to-secondary/50">
              <div className="aspect-square md:aspect-[4/3] relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-full object-contain p-4 transition-all duration-500 ${
                    imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  } group-hover:scale-105`}
                  onLoad={() => setImageLoaded(true)}
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {discountPercentage && (
                    <Badge className="bg-destructive text-destructive-foreground">
                      -{discountPercentage}%
                    </Badge>
                  )}
                  {product.inStock && (
                    <Badge className="bg-accent text-accent-foreground">
                      <Check className="w-3 h-3 mr-1" />
                      In Stock
                    </Badge>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="absolute top-3 right-3 p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-md hover:bg-background transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5 flex flex-col">
              {/* Category & Brand */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span>{product.category}</span>
                <span>•</span>
                <span className="font-medium text-primary">{product.brand}</span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(rating) 
                          ? "fill-amber-400 text-amber-400" 
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {rating} ({reviewCount} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {product.description}
              </p>

              {/* Key Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.features.slice(0, 4).map((feature, idx) => (
                  <div 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/60 rounded-md text-xs font-medium"
                  >
                    <feature.icon className="w-3.5 h-3.5 text-accent" />
                    {feature.text}
                  </div>
                ))}
              </div>

              {/* Price & Actions */}
              <div className="mt-auto flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      R{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        R{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Free delivery on orders over R5000</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/27815012993?text=Hi, I'm interested in the ${product.name} (${product.sku}) - R${product.price}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden lg:inline">Enquire</span>
                    </Button>
                  </a>
                  <Link to="/contact#quote-form">
                    <Button size="sm" className="cta-primary gap-1.5">
                      <ShoppingCart className="w-4 h-4" />
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View (Default)
  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Section */}
        <div className="relative bg-gradient-to-br from-secondary via-muted to-secondary/50">
          <div className="aspect-square relative overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-contain p-4 transition-all duration-500 ${
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              } group-hover:scale-110`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors duration-300" />

            {/* Quick Actions */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Button size="sm" variant="secondary" className="shadow-lg gap-1.5 bg-background/95 backdrop-blur-sm">
                <Eye className="w-4 h-4" />
                Quick View
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discountPercentage && (
                <Badge className="bg-destructive text-destructive-foreground font-bold">
                  -{discountPercentage}%
                </Badge>
              )}
              <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                {product.brand}
              </Badge>
            </div>

            {/* Wishlist & Stock */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-md hover:bg-background hover:scale-110 transition-all"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{product.category}</span>
            {product.inStock && (
              <span className="text-accent font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                In Stock
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(rating) 
                      ? "fill-amber-400 text-amber-400" 
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>

          {/* Key Specs */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.features.slice(0, 3).map((feature, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/80 rounded text-[11px] font-medium"
              >
                <feature.icon className="w-3 h-3 text-accent" />
                {feature.text}
              </span>
            ))}
          </div>

          {/* Price Section */}
          <div className="mt-auto pt-3 border-t border-border/50">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xl font-bold text-primary">
                R{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  R{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">
              inc VAT • excl. installation
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <a
                href={`https://wa.me/27815012993?text=Hi, I'm interested in the ${product.name} (${product.sku}) - R${product.price}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </Button>
              </a>
              <Link to="/contact#quote-form" className="flex-1">
                <Button size="sm" className="w-full cta-primary gap-1.5 text-xs">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
