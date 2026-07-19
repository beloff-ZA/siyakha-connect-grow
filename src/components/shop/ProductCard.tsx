import { Link } from "react-router-dom";
import type { ShopifyProduct } from "@/lib/shopify";
import { formatPrice } from "@/lib/shopify";
import ShareButton from "./ShareButton";

interface Props { product: ShopifyProduct }

const ProductCard = ({ product }: Props) => {
  const p = product.node;
  const img = p.images?.edges?.[0]?.node;
  const price = p.priceRange.minVariantPrice;

  return (
    <div className="group relative">
      <Link to={`/shop/${p.handle}`} className="block">
        <div className="aspect-square bg-white overflow-hidden mb-4 flex items-center justify-center p-4">
          {img ? (
            <img
              src={img.url}
              alt={img.altText || p.title}
              className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Siyakha</p>
          <h3 className="font-display text-lg text-foreground group-hover:text-accent transition-colors">{p.title}</h3>
          <p className="text-sm text-foreground">{formatPrice(price.amount, price.currencyCode)}</p>
        </div>
      </Link>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ShareButton title={p.title} url={`/shop/${p.handle}`} />
      </div>
    </div>
  );
};

export default ProductCard;
