import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CatalogProduct } from "@/modules/catalog/types";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  categorySlug: CatalogProduct["categorySlug"];
  priceClpTaxInc: number;
  image: string;
  availabilityStatus: CatalogProduct["availabilityStatus"];
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (product: CatalogProduct) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setHasHydrated: (value: boolean) => void;
  totalItems: () => number;
  subtotal: () => number;
}

function mergeCartItems(currentItems: CartItem[], persistedItems: CartItem[]) {
  const merged = new Map<string, CartItem>();

  for (const item of persistedItems) {
    merged.set(item.id, item);
  }

  for (const item of currentItems) {
    const existing = merged.get(item.id);

    if (existing) {
      merged.set(item.id, {
        ...existing,
        ...item,
        quantity: existing.quantity + item.quantity,
      });
      continue;
    }

    merged.set(item.id, item);
  }

  return Array.from(merged.values());
}

function toCartItem(product: CatalogProduct): CartItem {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categorySlug: product.categorySlug,
    priceClpTaxInc: product.priceClpTaxInc,
    image: product.image,
    availabilityStatus: product.availabilityStatus,
    quantity: 1,
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, toCartItem(product)],
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      subtotal: () =>
        get().items.reduce(
          (total, item) => total + item.priceClpTaxInc * item.quantity,
          0
        ),
    }),
    {
      name: "smk-vending-cart-v1",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<CartStore>;

        return {
          ...currentState,
          ...typedPersistedState,
          items: mergeCartItems(
            currentState.items,
            typedPersistedState.items ?? []
          ),
          hasHydrated: true,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
