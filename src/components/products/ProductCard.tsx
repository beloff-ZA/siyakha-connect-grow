import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Check, 
  MessageCircle,
  Eye,
  Truck,
  Plus,
  Minus,
  X,
  Share2
} from "lucide-react";
import { useState, forwardRef } from "react";
import { Link } from "react-router-dom";
import { useQuoteBasket } from "@/contexts/QuoteBasketContext";
import { toast } from "sonner";

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
  const [quantity, setQuantity] = useState(1);
  const [showQuickView, setShowQuickView] = useState(false);
  const { addItem, items } = useQuoteBasket();

  const productUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/products?product=${product.id}` 
    : `/products?product=${product.id}`;

  const handleShareWithClient = () => {
    const shareText = `Check out this product: ${product.name} - R${product.price.toLocaleString()} | ${productUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 12;
  
  const isInBasket = items.some(item => item.id === product.id);

  const handleAddToQuote = () => {
    addItem({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image: product.image,
      installationPrice: 450,
    }, quantity);
    toast.success(`${quantity}x ${product.name} added to quote basket`);
    setQuantity(1);
  };

  if (viewMode === "list") {
    return (
      <Card data-product-id={product.id} className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
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

                <div className="flex items-center gap-2">
                  {/* Quantity Selector */}
                  <div className="flex items-center bg-secondary rounded-lg border border-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-muted transition-colors rounded-l-lg"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-muted transition-colors rounded-r-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Button 
                    size="sm" 
                    className="cta-primary gap-1.5"
                    onClick={handleAddToQuote}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isInBasket ? "Add More" : "Add to Quote"}
                  </Button>
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
    <Card data-product-id={product.id} className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
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
              <Button 
                size="sm" 
                variant="secondary" 
                className="shadow-lg gap-1.5 bg-background/95 backdrop-blur-sm"
                onClick={() => setShowQuickView(true)}
              >
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

            {/* Quantity & Add to Quote */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center bg-secondary rounded-lg border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 hover:bg-muted transition-colors rounded-l-lg"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 hover:bg-muted transition-colors rounded-r-lg"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <Button 
                size="sm" 
                className="flex-1 cta-primary gap-1.5 text-xs"
                onClick={handleAddToQuote}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {isInBasket ? "Add More" : "Add to Quote"}
              </Button>
            </div>

            {/* WhatsApp Enquiry */}
            <a
              href={`https://wa.me/27815012993?text=Hi, I'm interested in the ${product.name} (${product.sku}) - R${product.price}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Enquiry
              </Button>
            </a>

            {/* Share with Clients */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-full gap-1.5 text-xs"
              onClick={handleShareWithClient}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share with Clients
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Quick View Modal */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold pr-8">{product.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-secondary via-muted to-secondary/50 rounded-lg overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              </div>
              {product.boxImage && (
                <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                  <img
                    src={product.boxImage}
                    alt={`${product.name} alternate view`}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              {/* Brand & Category */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                  {product.brand}
                </Badge>
                <Badge variant="outline">{product.category}</Badge>
                {product.inStock && (
                  <Badge className="bg-accent text-accent-foreground">
                    <Check className="w-3 h-3 mr-1" />
                    In Stock
                  </Badge>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
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

              {/* Price */}
              <div className="border-y border-border py-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    R{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      R{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">inc VAT • excl. installation</p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground">{product.description}</p>

              {/* Features */}
              <div>
                <h4 className="font-semibold mb-2">Key Features</h4>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feature, idx) => (
                    <div 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium"
                    >
                      <feature.icon className="w-4 h-4 text-accent" />
                      {feature.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div>
                <h4 className="font-semibold mb-2">Highlights</h4>
                <ul className="space-y-1.5">
                  {product.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* SKU & Warranty */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium">SKU:</span> {product.sku}</p>
                {product.manufacturerSku && (
                  <p><span className="font-medium">Manufacturer SKU:</span> {product.manufacturerSku}</p>
                )}
                <p><span className="font-medium">Warranty:</span> {product.warranty}</p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-secondary rounded-lg border border-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-muted transition-colors rounded-l-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-muted transition-colors rounded-r-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <Button 
                    className="flex-1 cta-primary gap-2"
                    onClick={() => {
                      handleAddToQuote();
                      setShowQuickView(false);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Quote
                  </Button>
                </div>
                <a
                  href={`https://wa.me/27815012993?text=Hi, I'm interested in the ${product.name} (${product.sku}) - R${product.price}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full gap-2">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Enquiry
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductCard;
