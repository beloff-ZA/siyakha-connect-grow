import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface QuoteItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  includeInstallation: boolean;
  installationPrice: number;
}

interface QuoteBasketContextType {
  items: QuoteItem[];
  addItem: (item: Omit<QuoteItem, "quantity" | "includeInstallation">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleInstallation: (id: string) => void;
  clearBasket: () => void;
  getTotal: () => { subtotal: number; installation: number; total: number };
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const QuoteBasketContext = createContext<QuoteBasketContextType | undefined>(undefined);

const STORAGE_KEY = "siyakha-quote-basket";
const INSTALLATION_RATE = 450; // R450 per camera installation

export const QuoteBasketProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<QuoteItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<QuoteItem, "quantity" | "includeInstallation">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        { ...newItem, quantity, includeInstallation: false, installationPrice: INSTALLATION_RATE },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const toggleInstallation = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, includeInstallation: !item.includeInstallation }
          : item
      )
    );
  };

  const clearBasket = () => {
    setItems([]);
    setIsOpen(false);
  };

  const getTotal = () => {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const installation = items.reduce(
      (acc, item) => acc + (item.includeInstallation ? item.installationPrice * item.quantity : 0),
      0
    );
    return { subtotal, installation, total: subtotal + installation };
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <QuoteBasketContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        toggleInstallation,
        clearBasket,
        getTotal,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </QuoteBasketContext.Provider>
  );
};

export const useQuoteBasket = () => {
  const context = useContext(QuoteBasketContext);
  if (!context) {
    throw new Error("useQuoteBasket must be used within a QuoteBasketProvider");
  }
  return context;
};
