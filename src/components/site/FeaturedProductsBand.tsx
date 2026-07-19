import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { PRODUCTS_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";

const FeaturedProductsBand = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 4, query: null });
        setProducts(data?.data?.products?.edges || []);
      } catch (e) {
        console.error("Failed to load featured products", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="border-t border-border bg-background">
      <div className="container mx-auto px-6 lg:px-10 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="overline text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-3">Shop</p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
              Hardware from our <span className="italic">deployments</span>.
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl">
              The same networking, surveillance and connectivity gear we install on live projects — available to order with delivery across South Africa.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground hover:opacity-70 transition-opacity self-start md:self-auto"
          >
            See more <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
            {products.map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 border border-foreground px-6 py-3 text-[11px] uppercase tracking-[0.22em] hover:bg-foreground hover:text-background transition-colors"
          >
            Browse the full shop <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsBand;