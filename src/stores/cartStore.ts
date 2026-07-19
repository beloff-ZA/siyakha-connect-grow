import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SHOPIFY_STORE_PERMANENT_DOMAIN, type ShopifyProduct } from "@/lib/shopify";

// Purely local cart. The shop is a B2B quote-request flow — we do not use
// Shopify's Storefront cart/checkout, so we don't gate on inventory or
// availableForSale. This lets clients build a quote for any product (even
// those marked sold out) and submit it to Eshlan for a formal quote/invoice.

export interface CartItem {
  lineId: string | null; // legacy — kept so persisted carts don't break
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  syncCart: () => void;
  getCheckoutUrl: () => string | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,

      addItem: (item) => {
        const cur = get().items;
        const existing = cur.find((i) => i.variantId === item.variantId);
        if (existing) {
          set({
            items: cur.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i,
            ),
          });
        } else {
          set({ items: [...cur, { ...item, lineId: null }] });
        }
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) { get().removeItem(variantId); return; }
        set({ items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)) });
      },

      removeItem: (variantId) => {
        const next = get().items.filter((i) => i.variantId !== variantId);
        next.length === 0 ? get().clearCart() : set({ items: next });
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => null,
      syncCart: () => { /* no-op — quote flow does not use Shopify checkout */ },
    }),
    {
      name: `shopify-cart-${SHOPIFY_STORE_PERMANENT_DOMAIN}`,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    },
  ),
);
