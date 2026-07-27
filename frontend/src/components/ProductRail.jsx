import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard.jsx';

export default function ProductRail({ title, subtitle, products, accent = 'leaf', selectedProductId }) {
  if (!products?.length) return null;

  return (
    <section className="px-3 xs:px-4 md:px-6 py-6 md:py-8">
      <div className="flex items-end justify-between mb-3 md:mb-4 gap-2">
        <div className="flex-1">
          <h2 className="font-display font-bold text-lg xs:text-xl md:text-2xl text-leaf-500 dark:text-turmeric-100">
            {title}
          </h2>
          {subtitle && <p className="text-xs xs:text-sm text-ink-500 dark:text-rice-200/70">{subtitle}</p>}
        </div>
        <button className="hidden sm:flex items-center gap-1 text-xs xs:text-sm font-medium text-leaf-500 dark:text-turmeric-100 hover:underline flex-shrink-0">
          View all <ChevronRight size={16} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4 }}
        className="flex gap-3 xs:gap-4 overflow-x-auto scrollbar-none pb-2 -mx-3 xs:-mx-4 px-3 xs:px-4 md:mx-0 md:px-0"
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} isSelected={selectedProductId === p.id} />
        ))}
      </motion.div>
    </section>
  );
}
