"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { BackendCart } from "@/lib/cart";

export type CartProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  color: string;
  delivery: string;
};

export type CartItem = CartProduct & { quantity: number };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  error: string;
  addItem: (product: CartProduct) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
};

const categoryColors: Record<string, string> = {
  Aroma: "#5b613d",
  Uyku: "#9683b1",
  "Ev Tekstili": "#bf5d30",
  Mutfak: "#cf902a",
  Banyo: "#034f4f",
};

const CartContext = createContext<CartContextValue | null>(null);

function mapCart(cart: BackendCart): CartItem[] {
  return cart.items.map((item) => ({
    id: item.product.productId,
    name: item.product.name,
    category: item.product.category,
    price: item.product.unitPrice,
    image: item.product.imageUrl ?? "/images/hero-home.png",
    color: categoryColors[item.product.category] ?? "#7a42c8",
    delivery: item.product.category === "Uyku" ? "1 gün" : "2 gün",
    quantity: item.quantity,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const replaceFromResponse = useCallback(async (response: Response) => {
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(payload?.message ?? "Sepet işlemi tamamlanamadı.");
    }

    const cart = (await response.json()) as BackendCart;
    setItems(mapCart(cart));
    setError("");
  }, []);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/account/cart", { cache: "no-store" });
      if (response.status === 401) {
        setItems([]);
        setError("");
        return;
      }
      await replaceFromResponse(response);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sepet yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [replaceFromResponse]);

  useEffect(() => {
    let active = true;

    fetch("/api/account/cart", { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        if (response.status === 401) {
          setItems([]);
          setError("");
          return;
        }
        await replaceFromResponse(response);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : "Sepet yüklenemedi.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [replaceFromResponse]);

  const addItem = useCallback(
    async (product: CartProduct) => {
      try {
        const response = await fetch("/api/account/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
        await replaceFromResponse(response);
      } catch (reason) {
        const failure =
          reason instanceof Error ? reason : new Error("Ürün eklenemedi.");
        setError(failure.message);
        throw failure;
      }
    },
    [replaceFromResponse],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      try {
        const response = await fetch(`/api/account/cart/items/${productId}`, {
          method: "DELETE",
        });
        await replaceFromResponse(response);
      } catch (reason) {
        setError(
          reason instanceof Error ? reason.message : "Ürün kaldırılamadı.",
        );
      }
    },
    [replaceFromResponse],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity < 1) {
        await removeItem(productId);
        return;
      }

      try {
        const response = await fetch(`/api/account/cart/items/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: Math.min(quantity, 9) }),
        });
        await replaceFromResponse(response);
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Ürün adedi güncellenemedi.",
        );
      }
    },
    [removeItem, replaceFromResponse],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      loading,
      error,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      refreshCart,
    }),
    [
      addItem,
      clearCart,
      error,
      items,
      loading,
      refreshCart,
      removeItem,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
