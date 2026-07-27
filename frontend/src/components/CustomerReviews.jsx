import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CustomerReviews({ reviews }) {
  return (
    <section className="px-4 md:px-6 py-12">
      <h2 className="font-display font-bold text-2xl text-leaf-500 dark:text-turmeric-100 text-center mb-8">
        What our customers say
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {reviews.map((r, i) => (
          <motion.figure
            key={r.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-card bg-white dark:bg-leaf-600/20 border border-leaf-100/60 dark:border-leaf-400/10 shadow-card p-5"
          >
            <div className="flex gap-0.5 text-turmeric-500 mb-2" aria-hidden="true">
              {Array.from({ length: r.rating }).map((_, idx) => (
                <Star key={idx} size={14} className="fill-turmeric-500" />
              ))}
            </div>
            <blockquote className="text-sm text-ink-700 dark:text-rice-200/85 leading-relaxed">
              "{r.comment}"
            </blockquote>
            <figcaption className="mt-3 text-xs font-semibold text-leaf-500 dark:text-turmeric-100">
              {r.name}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
