import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

const CartDrawer = () => {
  const [open, setOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const currency = items[0]?.price.currencyCode || "ZAR";
  const totalPrice = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);

  useEffect(() => { if (open) syncCart(); }, [open, syncCart]);

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) { window.open(url, "_blank"); setOpen(false); }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open cart"
          className="relative border border-border p-2 hover:bg-muted transition-colors"
        >
          <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-foreground text-background">
              {totalItems}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="font-display font-light text-2xl tracking-tight">Cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
                <p className="text-sm text-muted-foreground">Nothing here yet</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-4">
                {items.map((item) => {
                  const img = item.product.node.images?.edges?.[0]?.node;
                  return (
                    <div key={item.variantId} className="flex gap-4 pb-4 border-b border-border">
                      <div className="w-16 h-16 bg-muted overflow-hidden flex-shrink-0 grayscale">
                        {img && <img src={img.url} alt={img.altText || item.product.node.title} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.product.node.title}</h4>
                        {item.selectedOptions.length > 0 && (
                          <p className="text-xs text-muted-foreground">{item.selectedOptions.map((o) => o.value).join(" · ")}</p>
                        )}
                        <p className="text-sm mt-1">{formatPrice(item.price.amount, item.price.currencyCode)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button onClick={() => removeItem(item.variantId)} className="text-muted-foreground hover:text-foreground">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex items-center gap-1 border border-border">
                          <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-1 hover:bg-muted"><Minus className="h-3 w-3" /></button>
                          <span className="w-6 text-center text-xs">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-1 hover:bg-muted"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl">{formatPrice(totalPrice.toFixed(2), currency)}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || isLoading || isSyncing}
                  className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 text-[11px] uppercase tracking-[0.24em] h-12"
                >
                  {isLoading || isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><ExternalLink className="w-3.5 h-3.5 mr-2" />Secure Checkout</>)}
                </Button>
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground text-center">Checkout opens in a new tab</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
