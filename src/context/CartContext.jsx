import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'maison-elan-cart';

const safeNumber = (value) => Number(value) || 0;

const clampQuantity = (value) => Math.max(1, Math.min(Number(value) || 1, 99));
const maxStock = (product) => product.stock == null ? 99 : Math.max(0, Math.min(Number(product.stock) || 0, 99));

function readInitialCart() {
  if (typeof window === 'undefined') return [];

  try {
    const item = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!item) return [];
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Cart persistence failed:', error);
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'hydrate': {
      return Array.isArray(action.payload) ? action.payload : [];
    }
    case 'add': {
      const { product, quantity = 1 } = action;
      const stockLimit = maxStock(product);
      if (product.available === false || stockLimit === 0) return state;
      const nextQuantity = Math.min(clampQuantity(quantity), stockLimit);
      const existingItem = state.find((item) => item.productId === product.id);

      if (existingItem) {
        return state.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(clampQuantity(item.quantity + nextQuantity), stockLimit), product, price: safeNumber(product.price), image: product.images?.[0] || item.image }
            : item,
        );
      }

      return [
        ...state,
        {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          image: product.images?.[0] || '',
          price: safeNumber(product.price),
          quantity: nextQuantity,
          product,
          brand: product.brand || '',
          variant: action.variant || product.size || null,
          stock: product.stock,
        },
      ];
    }
    case 'updateQty': {
      if (!Number.isFinite(action.quantity) || action.quantity < 1) {
        return state.filter((item) => item.productId !== action.productId);
      }

      return state
        .map((item) => item.productId === action.productId
          ? { ...item, quantity: Math.min(clampQuantity(action.quantity), maxStock(item.product || item)) }
          : item,
        )
        .filter((item) => item.quantity > 0);
    }
    case 'remove': {
      return state.filter((item) => item.productId !== action.productId);
    }
    case 'clear': {
      return [];
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], readInitialCart);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Cart persistence failed:', error);
    }
  }, [cart]);

  const addItem = useCallback((product, quantity = 1, variant = null) => {
    if (!product) return;
    dispatch({ type: 'add', product, quantity, variant });
  }, []);

  const updateQty = useCallback((productId, quantity) => {
    if (!productId) return;
    dispatch({ type: 'updateQty', productId, quantity });
  }, []);

  const removeItem = useCallback((productId) => {
    if (!productId) return;
    dispatch({ type: 'remove', productId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + safeNumber(item.quantity), 0),
    [cart],
  );

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + safeNumber(item.price) * safeNumber(item.quantity), 0),
    [cart],
  );

  const shipping = subtotal > 5000 ? 0 : 350;
  const total = subtotal + shipping;

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      subtotal,
      shipping,
      total,
      addItem,
      updateQty,
      removeItem,
      clearCart,
    }),
    [addItem, cart, cartCount, removeItem, shipping, subtotal, total, updateQty, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
