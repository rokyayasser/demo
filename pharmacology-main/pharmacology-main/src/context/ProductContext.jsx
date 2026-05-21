/* eslint-disable no-empty */
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import api from "../api/axios.config";

export const ProductContext = createContext(null);

const CART_KEY = "pharmacology_cart";
const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};
const saveCart = (c) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(c));
  } catch {}
};

const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.data?.data)) return data.data.data;
  if (Array.isArray(data.data?.products)) return data.data.products;
  if (Array.isArray(data.products)) return data.products;
  return [];
};

const ProductContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(loadCart);
  const [isLoading, setIsLoading] = useState(false);
  const fetchedRef = useRef(false);
  const fetchingRef = useRef(false);

  // Sync cart → localStorage on every change
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const getAllProducts = useCallback(async (force = false) => {
    if (fetchingRef.current) return;
    if (fetchedRef.current && !force) return;
    fetchingRef.current = true;
    setIsLoading(true);
    try {
      const res = await api.get("/api/v1/products");
      setProducts(extractArray(res.data));
      fetchedRef.current = true;
    } catch (err) {
      if (err.response) console.error("getAllProducts:", err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const getProductById = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/api/v1/products/${id}`);
      return data.success ? data.data?.product || data.data || null : null;
    } catch {
      return null;
    }
  }, []);
  const getProductDetails = getProductById;
  const getCart = useCallback(() => Promise.resolve(cart), [cart]);

  const addToCart = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const ex = prev.find((i) => i._id === product._id);
      return ex
        ? prev.map((i) =>
            i._id === product._id ? { ...i, quantity: i.quantity + qty } : i,
          )
        : [...prev, { ...product, quantity: qty }];
    });
    toast.success("تم إضافة المنتج للسلة ✓");
  }, []);

  const removeFromCart = useCallback(
    (id) => setCart((p) => p.filter((i) => i._id !== id)),
    [],
  );
  const clearCart = useCallback(() => setCart([]), []);
  const updateCartQty = useCallback(
    (id, qty) => {
      if (qty <= 0) {
        removeFromCart(id);
        return;
      }
      setCart((p) =>
        p.map((i) => (i._id === id ? { ...i, quantity: qty } : i)),
      );
    },
    [removeFromCart],
  );

  // Auto-fetch on mount
  useEffect(() => {
    const t = setTimeout(() => getAllProducts(), 200);
    return () => clearTimeout(t);
  }, [getAllProducts]);

  const cartTotal = cart.reduce(
    (s, i) => s + (i.discountPrice || i.price || 0) * i.quantity,
    0,
  );
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        getAllProducts,
        getProductById,
        getProductDetails,
        cart,
        cartTotal,
        cartCount,
        getCart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export { ProductContextProvider as ProductProvider };
export default ProductContextProvider;
