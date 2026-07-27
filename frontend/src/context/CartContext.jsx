import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { product, quantity }
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const setQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeItem(productId);
    setItems((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));
  };

  const { subtotal, itemCount } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.subtotal += i.product.sellingPrice * i.quantity;
        acc.itemCount += i.quantity;
        return acc;
      },
      { subtotal: 0, itemCount: 0 }
    );
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, setQuantity, subtotal, itemCount, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
