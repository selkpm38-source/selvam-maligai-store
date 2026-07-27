/**
 * Placeholder catalog data. Phase 2 replaces this with real calls to
 * GET /api/products (category, discount, featured, etc. all come from the
 * `products` table already defined in the Phase 1 schema). Shape here
 * matches that table 1:1 so swapping the data source later is a no-op.
 */

export const categories = [
  { id: 'c1', name: 'Rice & Grains', icon: '🌾' },
  { id: 'c2', name: 'Dals & Pulses', icon: '🫘' },
  { id: 'c3', name: 'Spices & Masalas', icon: '🌶️' },
  { id: 'c4', name: 'Oils & Ghee', icon: '🫙' },
  { id: 'c5', name: 'Snacks', icon: '🍿' },
  { id: 'c6', name: 'Dairy', icon: '🥛' },
  { id: 'c7', name: 'Vegetables', icon: '🥬' },
  { id: 'c8', name: 'Beverages', icon: '☕' },
];

function product(overrides) {
  return {
    id: overrides.id,
    name: overrides.name,
    category: overrides.category,
    image: overrides.image,
    mrp: overrides.mrp,
    sellingPrice: overrides.sellingPrice,
    discountPercentage: Math.round(((overrides.mrp - overrides.sellingPrice) / overrides.mrp) * 100),
    unit: overrides.unit,
    rating: overrides.rating ?? 4.3,
    ratingCount: overrides.ratingCount ?? 128,
    stockStatus: overrides.stockStatus ?? 'in_stock',
    isFeatured: !!overrides.isFeatured,
    isTrending: !!overrides.isTrending,
    isBestseller: !!overrides.isBestseller,
    isNewArrival: !!overrides.isNewArrival,
  };
}

export const products = [
  product({ id: 'p1', name: 'Ponni Boiled Rice', category: 'Rice & Grains', image: '🍚', mrp: 620, sellingPrice: 549, unit: '10 kg', isFeatured: true, isBestseller: true, rating: 4.6 }),
  product({ id: 'p2', name: 'Toor Dal (Split Pigeon Pea)', category: 'Dals & Pulses', image: '🫘', mrp: 165, sellingPrice: 139, unit: '1 kg', isFeatured: true, rating: 4.4 }),
  product({ id: 'p3', name: 'Sambar Powder', category: 'Spices & Masalas', image: '🌶️', mrp: 95, sellingPrice: 79, unit: '200 g', isTrending: true, rating: 4.7 }),
  product({ id: 'p4', name: 'Cold-Pressed Groundnut Oil', category: 'Oils & Ghee', image: '🫙', mrp: 340, sellingPrice: 289, unit: '1 L', isFeatured: true, rating: 4.5 }),
  product({ id: 'p5', name: 'Murukku (Handmade)', category: 'Snacks', image: '🥨', mrp: 90, sellingPrice: 75, unit: '250 g', isNewArrival: true, rating: 4.2 }),
  product({ id: 'p6', name: 'Fresh Cow Ghee', category: 'Dairy', image: '🧈', mrp: 620, sellingPrice: 549, unit: '500 ml', isBestseller: true, rating: 4.8 }),
  product({ id: 'p7', name: 'Curry Leaves (Fresh)', category: 'Vegetables', image: '🌿', mrp: 20, sellingPrice: 15, unit: '100 g', rating: 4.1 }),
  product({ id: 'p8', name: 'Filter Coffee Powder', category: 'Beverages', image: '☕', mrp: 210, sellingPrice: 179, unit: '500 g', isTrending: true, isBestseller: true, rating: 4.9 }),
  product({ id: 'p9', name: 'Idli / Dosa Rice', category: 'Rice & Grains', image: '🍚', mrp: 480, sellingPrice: 419, unit: '10 kg', rating: 4.3 }),
  product({ id: 'p10', name: 'Urad Dal (Split)', category: 'Dals & Pulses', image: '🫘', mrp: 145, sellingPrice: 129, unit: '1 kg', isNewArrival: true, rating: 4.2 }),
  product({ id: 'p11', name: 'Turmeric Powder', category: 'Spices & Masalas', image: '🟡', mrp: 60, sellingPrice: 49, unit: '200 g', isFeatured: true, rating: 4.6 }),
  product({ id: 'p12', name: 'Banana Chips', category: 'Snacks', image: '🍌', mrp: 110, sellingPrice: 89, unit: '200 g', isTrending: true, rating: 4.4 }),
];

export const dealsOfToday = products.filter((p) => p.discountPercentage >= 12);
export const featuredProducts = products.filter((p) => p.isFeatured);
export const trendingProducts = products.filter((p) => p.isTrending);
export const bestSellers = products.filter((p) => p.isBestseller);
export const newArrivals = products.filter((p) => p.isNewArrival);
export const recommended = products.slice(2, 8);

export const reviews = [
  { id: 'r1', name: 'Meena R.', rating: 5, comment: 'Rice quality is exactly like the shop near my hometown. Delivery was quick too.' },
  { id: 'r2', name: 'Arun K.', rating: 5, comment: 'Filter coffee powder is fresh and aromatic — reorder every month now.' },
  { id: 'r3', name: 'Priya S.', rating: 4, comment: 'Good packaging for the murukku, arrived without breaking. Will order again.' },
  { id: 'r4', name: 'Karthik V.', rating: 5, comment: 'Ghee tastes homemade. Prices are fair compared to the supermarket.' },
];

export const storeStats = [
  { label: 'Happy Customers', value: 42000, suffix: '+' },
  { label: 'Products Stocked', value: 1800, suffix: '+' },
  { label: 'Towns Served', value: 24, suffix: '' },
  { label: 'Years Serving You', value: 43, suffix: '' },
];
