import { motion } from 'framer-motion';
import { Star, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product, isSelected = false }) {
  const { addItem } = useCart();

  return (
    <motion.article
      id={`product-${product.id}`}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative w-40 xs:w-44 sm:w-52 shrink-0 rounded-card bg-white dark:bg-leaf-600/20 shadow-card border border-leaf-100/60 dark:border-leaf-400/10 overflow-hidden ${isSelected ? 'ring-2 ring-leaf-500 ring-offset-2 dark:ring-turmeric-400' : ''}`}
    >
      {product.discountPercentage > 0 && (
        <span className="absolute top-1.5 left-1.5 z-10 rounded-full bg-kumkum-500 text-white text-[10px] xs:text-[11px] font-semibold px-2 py-0.5">
          {product.discountPercentage}% OFF
        </span>
      )}

      <div className="grid place-items-center h-24 xs:h-28 sm:h-32 bg-rice-200 dark:bg-leaf-900/40 overflow-hidden">
        {typeof product.image === 'string' && product.image.startsWith('data:image') ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl xs:text-5xl">{product.image}</span>
        )}
      </div>

      <div className="p-2 xs:p-3">
        <h3 className="text-xs xs:text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
        <p className="text-xs text-ink-500 dark:text-rice-200/70 mt-0.5">{product.unit}</p>

        <div className="flex items-center gap-1 mt-1 text-xs text-ink-500 dark:text-rice-200/70">
          <Star size={12} className="fill-turmeric-500 text-turmeric-500" />
          {product.rating} ({product.ratingCount})
        </div>

        <div className="flex items-end justify-between mt-2 gap-1">
          <div className="flex-1">
            <p className="price text-xs xs:text-sm font-semibold text-leaf-500 dark:text-turmeric-100">
              ₹{product.sellingPrice}
            </p>
            {product.mrp !== product.sellingPrice && (
              <p className="price text-[10px] xs:text-xs text-ink-500 line-through">₹{product.mrp}</p>
            )}
            <a
              href="https://wa.me/919345786927?text=Hi%2C%20I%20would%20like%20to%20know%20the%20wholesale%20price."
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-[9px] xs:text-[10px] leading-tight text-leaf-600 dark:text-turmeric-100 hover:underline"
            >
              Retail price · WhatsApp for wholesale
            </a>
          </div>

          <button
            onClick={() => addItem(product)}
            aria-label={`Add ${product.name} to cart`}
            className="grid place-items-center w-7 xs:w-8 h-7 xs:h-8 rounded-full bg-leaf-500 text-white hover:bg-leaf-400 active:scale-95 transition flex-shrink-0"
          >
            <Plus size={14} className="xs:hidden" />
            <Plus size={16} className="hidden xs:block" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
