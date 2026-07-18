import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCT_BY_HANDLE_QUERY, formatPrice, storefrontApiRequest, type ShopifyProductNode } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import SiteSEO from "@/components/site/SiteSEO";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProductNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [variantId, setVariantId] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    if (!handle) return;
    (async () => {
      try {
        const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
        const p = data?.data?.product as ShopifyProductNode | null;
        if (!p) { setNotFound(true); return; }
        setProduct(p);
        setVariantId(p.variants.edges[0]?.node.id || "");
      } finally {
        setLoading(false);
      }
    })();
  }, [handle]);

  const selectedVariant = useMemo(() => product?.variants.edges.find((v) => v.node.id === variantId)?.node, [product, variantId]);
  const images = product?.images.edges || [];
  const mainImg = images[imgIdx]?.node;

  const handleAdd = async () => {
    if (!product || !selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: qty,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Added to cart", { position: "top-center" });
  };

  return (
    <>
      {product && (
        <SiteSEO
          title={`${product.title} — Siyakha Shop`}
          description={product.description?.slice(0, 155) || `Buy ${product.title} from Siyakha Technology.`}
          canonical={`https://siyakhatechnology.co.za/shop/${product.handle}`}
        />
      )}
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-6 lg:px-10 py-10">
          <Link to="/shop" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to shop
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : notFound || !product ? (
            <div className="text-center py-24">
              <h1 className="font-display text-2xl mb-4">Product not found</h1>
              <Link to="/shop" className="underline text-sm">Return to shop</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
              <div>
                <div className="aspect-square bg-muted overflow-hidden mb-4">
                  {mainImg ? (
                    <img src={mainImg.url} alt={mainImg.altText || product.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  ) : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>}
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((im, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`aspect-square bg-muted overflow-hidden border ${i === imgIdx ? "border-foreground" : "border-transparent"}`}
                      >
                        <img src={im.node.url} alt="" className="w-full h-full object-cover grayscale" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-3">Siyakha Shop</p>
                <h1 className="font-display font-light text-3xl md:text-5xl tracking-tight leading-[1.05] mb-4">{product.title}</h1>
                <p className="text-2xl mb-6">
                  {selectedVariant ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode) : formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
                </p>

                {product.description && (
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">{product.description}</p>
                )}

                {product.variants.edges.length > 1 && (
                  <div className="mb-6">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Options</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.edges.map((v) => {
                        const on = v.node.id === variantId;
                        return (
                          <button
                            key={v.node.id}
                            onClick={() => setVariantId(v.node.id)}
                            disabled={!v.node.availableForSale}
                            className={`px-4 py-2 text-xs uppercase tracking-[0.18em] border transition-colors ${on ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"} ${!v.node.availableForSale ? "opacity-40 line-through" : ""}`}
                          >
                            {v.node.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Quantity</p>
                  <div className="inline-flex items-center border border-border">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-12 text-center">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="p-3 hover:bg-muted"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                <Button
                  onClick={handleAdd}
                  disabled={!selectedVariant?.availableForSale || isLoading}
                  className="w-full md:w-auto rounded-none bg-foreground text-background hover:bg-foreground/90 text-[11px] uppercase tracking-[0.24em] h-12 px-8"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><ShoppingBag className="w-3.5 h-3.5 mr-2" />{selectedVariant?.availableForSale ? "Add to Cart" : "Sold Out"}</>)}
                </Button>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProductDetail;
