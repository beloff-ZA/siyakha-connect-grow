import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { PRODUCTS_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";

// Curated set of product search terms relevant to schools:
// interactive smartboards, laptops/computers, NAS storage,
// long-range Wi-Fi APs, and 48-port switches.
const SEARCH_QUERIES = [
  "whiteboard",
  "smartboard",
  "interactive",
  "macbook",
  "laptop",
  "mac mini",
  "synology",
  "nas",
  "long range",
  "GWN",
  "48 port",
  "48-port",
];

const SchoolProductsBand = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.all(
          SEARCH_QUERIES.map((q) =>
            storefrontApiRequest(PRODUCTS_QUERY, { first: 4, query: q }).catch(() => null),
          ),
        );
        const seen = new Set<string>();
        const merged: ShopifyProduct[] = [];
        for (const data of results) {
          const edges: ShopifyProduct[] = data?.data?.products?.edges || [];
          for (const edge of edges) {
            if (seen.has(edge.node.id)) continue;
            const hay = `${edge.node.title} ${edge.node.productType ?? ""} ${(edge.node.tags ?? []).join(" ")}`.toLowerCase();
            // Filter out irrelevant matches (e.g. cables titled "long")
            const relevant =
              /whiteboard|smartboard|interactive/.test(hay) ||
              /macbook|laptop|mac mini|imac|notebook|chromebook/.test(hay) ||
              /synology|\bnas\b|diskstation|rackstation/.test(hay) ||
              /(long[- ]?range|gwn76|outdoor.*(ap|access point)|wi[- ]?fi 7.*ap)/.test(hay) ||
              /(48[- ]?port|48\s*port switch)/.test(hay);
            if (!relevant) continue;
            seen.add(edge.node.id);
            merged.push(edge);
          }
        }
        setProducts(merged.slice(0, 8));
      } catch (e) {
        console.error("Failed to load school products", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="border-t border-foreground/10 bg-background">
      <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
              Equipment for schools
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
              Classroom-ready <span className="italic font-extralight">hardware</span>.
            </h2>
            <p className="mt-4 text-sm md:text-base text-muted-foreground">
              Smartboards, laptops, NAS storage, long-range Wi-Fi and 48-port switches — the gear we deploy in real schools, available to order with delivery across South Africa.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground hover:opacity-70 transition-opacity self-start md:self-auto"
          >
            Browse full shop <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
            {products.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SchoolProductsBand;