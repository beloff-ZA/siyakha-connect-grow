import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { PRODUCTS_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import { ArrowLeft, Loader2 } from "lucide-react";
import SiteSEO from "@/components/site/SiteSEO";

const Shop = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50, query: null });
        setProducts(data?.data?.products?.edges || []);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <SiteSEO
        title="Shop — Siyakha Technology"
        description="Buy IT hardware, networking equipment, cameras, cabling and accessories from Siyakha Technology. Secure checkout, fast delivery across South Africa."
        path="/shop"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="container mx-auto px-6 lg:px-10 pt-10 pb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back home
            </Link>
          </section>
          <section className="container mx-auto px-6 lg:px-10 pb-6">
            <p className="overline text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-4">Shop</p>
            <h1 className="font-display font-light text-4xl md:text-6xl tracking-[-0.02em] leading-[1.02]">
              Hardware & <span className="italic">accessories</span>.
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-2xl">
              Curated equipment we deploy on live projects — networking, surveillance, cabling and everyday IT gear. Secure checkout with delivery across South Africa.
            </p>
          </section>

          <section className="container mx-auto px-6 lg:px-10 py-12">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-24 text-sm text-muted-foreground">Couldn't load products: {error}</div>
            ) : products.length === 0 ? (
              <div className="border border-border p-12 text-center max-w-2xl mx-auto">
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-3">No products yet</p>
                <h2 className="font-display text-2xl font-light mb-3">The shelves are being stocked.</h2>
                <p className="text-sm text-muted-foreground">
                  We're loading our first products now. In the meantime, <Link to="/" className="underline">explore our services</Link> or <a href="mailto:nikita@siyakhatechnology.co.za" className="underline">email us</a> for a direct quote.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
                {products.map((p) => <ProductCard key={p.node.id} product={p} />)}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Shop;
