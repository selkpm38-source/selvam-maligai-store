import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { products as rawProducts } from '../data/mockProducts.js';
import apiClient from '../api/axiosClient.js';

const ProductsContext = createContext(null);
const STORAGE_KEY = 'selvam-products';

const loadInitialProducts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore invalid JSON
  }
  return rawProducts;
};

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(loadInitialProducts);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient.get('/products')
      .then(({ data }) => {
        if (!cancelled && Array.isArray(data.data)) {
          setProducts(data.data);
          setApiAvailable(true);
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const updateProduct = async (updatedProduct) => {
    if (apiAvailable) {
      const { data } = await apiClient.put(`/products/${updatedProduct.id}`, updatedProduct);
      setProducts((prev) => prev.map((product) => (product.id === updatedProduct.id ? data.data : product)));
      return data.data;
    }
    setProducts((prev) => prev.map((product) => (product.id === updatedProduct.id ? { ...product, ...updatedProduct } : product)));
    return updatedProduct;
  };

  const addProduct = async (newProduct) => {
    if (apiAvailable) {
      const { data } = await apiClient.post('/products', newProduct);
      setProducts((prev) => [data.data, ...prev]);
      return data.data.id;
    }
    const id = `p${Date.now()}`;
    const product = {
      id,
      rating: 4.0,
      ratingCount: 0,
      discountPercentage: Math.round(((newProduct.mrp - newProduct.sellingPrice) / newProduct.mrp) * 100),
      isFeatured: false,
      isTrending: false,
      isBestseller: false,
      isNewArrival: false,
      ...newProduct,
    };
    setProducts((prev) => [product, ...prev]);
    return id;
  };

  const deleteProduct = async (productId) => {
    if (apiAvailable) await apiClient.delete(`/products/${productId}`);
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  const dealsOfToday = useMemo(
    () => products.filter((product) => product.discountPercentage >= 12),
    [products]
  );
  const featuredProducts = useMemo(() => products.filter((product) => product.isFeatured), [products]);
  const trendingProducts = useMemo(() => products.filter((product) => product.isTrending), [products]);
  const bestSellers = useMemo(() => products.filter((product) => product.isBestseller), [products]);
  const newArrivals = useMemo(() => products.filter((product) => product.isNewArrival), [products]);
  const recommended = useMemo(() => products.slice(2, 8), [products]);

  return (
    <ProductsContext.Provider
      value={{ products, dealsOfToday, featuredProducts, trendingProducts, bestSellers, newArrivals, recommended, updateProduct, addProduct, deleteProduct }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
