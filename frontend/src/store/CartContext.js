import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ restaurantId: null, restaurantName: '', items: [] });

  const addItem = (restaurantId, restaurantName, item) => {
    // Prevent mixing restaurants
    if (cart.restaurantId && cart.restaurantId !== restaurantId) {
      return {
        error: true,
        message: `You already have items from "${cart.restaurantName}". Clear cart to order from a different restaurant.`
      };
    }

    setCart(prev => {
      const existing = prev.items.find(i => i.menuItemId === item.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(i =>
            i.menuItemId === item.id
              ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.price }
              : i
          )
        };
      }
      return {
        restaurantId,
        restaurantName,
        items: [...prev.items, {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          totalPrice: item.price
        }]
      };
    });
    return { error: false };
  };

  const removeItem = (menuItemId) => {
    setCart(prev => {
      const updated = prev.items.filter(i => i.menuItemId !== menuItemId);
      return updated.length === 0
        ? { restaurantId: null, restaurantName: '', items: [] }
        : { ...prev, items: updated };
    });
  };

  const updateQuantity = (menuItemId, qty) => {
    if (qty <= 0) { removeItem(menuItemId); return; }
    setCart(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.menuItemId === menuItemId
          ? { ...i, quantity: qty, totalPrice: qty * i.price }
          : i
      )
    }));
  };

  const clearCart = () => setCart({ restaurantId: null, restaurantName: '', items: [] });

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal   = cart.items.reduce((sum, i) => sum + i.totalPrice, 0);

  return (
    <CartContext.Provider value={{
      cart, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
