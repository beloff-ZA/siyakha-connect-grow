import { Link } from "react-router-dom";
import type { ShopifyProduct } from "@/lib/shopify";
import { formatPrice } from "@/lib/shopify";
import ShareButton from "./ShareButton";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Plus, Check } from "lucide-react";
import { useState } from "react";

interface Props { product: ShopifyProduct }

const ProductCard = ({ product }: Props) => {
  const p = product.node;
  const img = p.images?.edges?.[0]?.node;
  const price = p.priceRange.minVariantPrice;
  const variant = p.variants?.edges?.[0]?.node;
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const inCart = variant ? items.find((i) => i.variantId === variant.id)?.quantity ?? 0 : 0;
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
    toast.success("Added to quote", { description: p.title });
  };

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
      {variant && (
        <button
          onClick={handleAdd}
          aria-label={justAdded ? "Added" : "Add to quote"}
          className={`mt-3 w-full flex items-center justify-center gap-2 border border-border py-2.5 text-[11px] uppercase tracking-[0.22em] transition-colors ${
            justAdded
              ? "bg-foreground text-background border-foreground"
              : "bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground"
          }`}
        >
          {justAdded ? (<><Check className="h-3.5 w-3.5" /> Added{inCart > 1 ? ` · ${inCart}` : ""}</>) : (<><Plus className="h-3.5 w-3.5" /> Add to quote{inCart > 0 ? ` · ${inCart}` : ""}</>)}
        </button>
      )}
    </div>
  );
};

export default ProductCard;
