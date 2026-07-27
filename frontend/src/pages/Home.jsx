import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider.jsx';
import CategoryChips from '../components/CategoryChips.jsx';
import ProductRail from '../components/ProductRail.jsx';
import StoreStats from '../components/StoreStats.jsx';
import { WhyChooseUs, AboutStore } from '../components/StoreInfo.jsx';
import Newsletter from '../components/Newsletter.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import { categories, storeStats } from '../data/mockProducts.js';
import { getMatchingProducts } from '../utils/productSearch.js';

export default function Home() {
  const location = useLocation();
  const { dealsOfToday, featuredProducts, trendingProducts, bestSellers, newArrivals, recommended, products } = useProducts();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.trim() ?? '';
  const selectedProductId = searchParams.get('selected');

  const searchResults = useMemo(() => getMatchingProducts(products, searchQuery), [products, searchQuery]);
  const showSearchResults = Boolean(searchQuery);

  return (
    <main>
      <HeroSlider />
      <CategoryChips categories={categories} />

      {showSearchResults && (
        searchResults.length > 0 ? (
          <ProductRail
            title={`Search results for “${searchQuery}”`}
            subtitle="Tap any match to jump to that product card."
            products={searchResults}
            selectedProductId={selectedProductId}
          />
        ) : (
          <section className="px-3 xs:px-4 md:px-6 py-6 md:py-8">
            <div className="rounded-2xl border border-dashed border-leaf-200 bg-rice-50 p-4 text-sm text-ink-600 dark:border-leaf-400/20 dark:bg-leaf-700/40 dark:text-rice-100">
              No products matched “{searchQuery}”. Try another name, category, or unit.
            </div>
          </section>
        )
      )}

      <ProductRail
        title="Today's Deals"
        subtitle="Discounted the moment we add them — while stock lasts"
        products={dealsOfToday}
        selectedProductId={selectedProductId}
      />
      <ProductRail title="Featured Products" products={featuredProducts} selectedProductId={selectedProductId} />
      <ProductRail title="Trending Now" products={trendingProducts} selectedProductId={selectedProductId} />
      <ProductRail title="Top Selling" products={bestSellers} selectedProductId={selectedProductId} />
      <ProductRail title="Recently Added" products={newArrivals} selectedProductId={selectedProductId} />

      <StoreStats stats={storeStats} />

      <ProductRail title="Recommended For You" subtitle="Based on what customers like you buy" products={recommended} selectedProductId={selectedProductId} />

      <WhyChooseUs />
      <AboutStore />
      <Newsletter />
    </main>
  );
}
