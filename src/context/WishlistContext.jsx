import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);
const WISHLIST_STORAGE_KEY = 'maison-elan-wishlist';

function readInitialWishlist() {
  if (typeof window === 'undefined') return [];

  try {
    const item = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!item) return [];
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Wishlist persistence failed:', error);
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(readInitialWishlist);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Wishlist persistence failed:', error);
    }
  }, [wishlist]);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((item) => item !== productId)
        : [...current, productId],
    );
  }, []);

  const isFavorite = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  const value = useMemo(
    () => ({ wishlist, toggleWishlist, isFavorite }),
    [isFavorite, toggleWishlist, wishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used inside WishlistProvider');
  }

  return context;
}
