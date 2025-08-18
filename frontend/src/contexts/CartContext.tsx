// // src/contexts/CartContext.tsx
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
// } from 'react';
// import { ProductRecommendation } from '../services/symptomService';

// export interface CartItem extends ProductRecommendation {
//   quantity: number;
// }

// interface CartContextValue {
//   items: CartItem[];
//   add: (p: ProductRecommendation) => void;
//   remove: (id: number) => void;
//   updateQuantity: (id: number, quantity: number) => void;
//   clear: () => void;
//   totalItems: number;
//   totalPrice: number;
// }

// const STORAGE_KEY = 'pharmacy_tablet_cart';

// const CartContext = createContext<CartContextValue | null>(null);

// export const useCart = (): CartContextValue => {
//   const ctx = useContext(CartContext);
//   if (!ctx) throw new Error('useCart must be inside a <CartProvider>');
//   return ctx;
// };

// export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   // 1) Initialize from localStorage
//   const [items, setItems] = useState<CartItem[]>(() => {
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       return raw ? JSON.parse(raw) : [];
//     } catch {
//       return [];
//     }
//   });

//   // 2) Persist on every change
//   useEffect(() => {
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
//     } catch {
//       // ignore
//     }
//   }, [items]);

//   // 3) Add / increment
//   const add = useCallback((p: ProductRecommendation) => {
//     setItems((cur) => {
//       const idx = cur.findIndex((i) => i.id === p.id);
//       if (idx >= 0) {
//         const next = [...cur];
//         next[idx].quantity += 1;
//         return next;
//       }
//       return [...cur, { ...p, quantity: 1 }];
//     });
//   }, []);

//   // 4) Remove entirely
//   const remove = useCallback((id: number) => {
//     setItems((cur) => cur.filter((i) => i.id !== id));
//   }, []);

//   // 5) Update (set) quantity
//   const updateQuantity = useCallback((id: number, quantity: number) => {
//     setItems((cur) => {
//       if (quantity <= 0) {
//         return cur.filter((i) => i.id !== id);
//       }
//       return cur.map((i) =>
//         i.id === id
//           ? {
//               ...i,
//               quantity,
//             }
//           : i
//       );
//     });
//   }, []);

//   // 6) Clear all
//   const clear = useCallback(() => setItems([]), []);

//   // 7) Compute totals
//   const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
//   const totalPrice = items.reduce(
//     (sum, i) => sum + (i.price_eur || 0) * i.quantity,
//     0
//   );

//   const value: CartContextValue = {
//     items,
//     add,
//     remove,
//     updateQuantity,
//     clear,
//     totalItems,
//     totalPrice,
//   };

//   return (
//     <CartContext.Provider value={value}>{children}</CartContext.Provider>
//   );
// };


// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductRecommendation } from '../services/symptomService';

interface CartItem extends ProductRecommendation {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  add: (p: ProductRecommendation) => void;
  removeOne: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart');
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const add = (p: ProductRecommendation) => {
    setItems((cur) => {
      const idx = cur.findIndex((i) => i.id === p.id);
      if (idx >= 0) {
        const next = [...cur];
        next[idx].quantity += 1;
        return next;
      }
      return [...cur, { ...p, quantity: 1 }];
    });
  };

  const removeOne = (id: number) => {
    setItems((cur) => {
      const idx = cur.findIndex((i) => i.id === id);
      if (idx === -1) return cur;
      const next = [...cur];
      if (next[idx].quantity > 1) {
        next[idx].quantity -= 1;
        return next;
      }
      // if only 1 left, remove entirely
      next.splice(idx, 1);
      return next;
    });
  };

  const remove = (id: number) => {
    setItems((cur) => cur.filter((i) => i.id !== id));
  };

  const clear = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, totalItems, add, removeOne, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
};
