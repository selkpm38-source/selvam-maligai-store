import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const slides = [
  {
    id: 's1',
    eyebrow: 'This week only',
    title: 'Fresh Ponni rice,\nstraight from the mill',
    body: 'Stock your kitchen with the staples your amma trusts — now delivered in under 60 minutes.',
    cta: 'Shop rice & grains',
  },
  {
    id: 's2',
    eyebrow: "Today's discount",
    title: 'Up to 25% off\nhome-ground spices',
    body: 'Sambar powder, turmeric, and chilli powder — ground fresh, packed for freshness.',
    cta: 'See today’s deals',
  },
  {
    id: 's3',
    eyebrow: 'New this month',
    title: 'Cold-pressed oils,\nno shortcuts',
    body: 'Groundnut and gingelly oil, extracted the traditional way. No preservatives, ever.',
    cta: 'Explore oils & ghee',
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  const slide = slides[index];

  return (
    <div className="relative">
      <div className="relative overflow-hidden bg-leaf-500 dark:bg-leaf-600">
        {/* Ambient texture: soft radial highlight, not a stock photo — keeps focus on type */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />

        <div className="relative px-4 xs:px-6 md:px-12 py-10 xs:py-14 md:py-20 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <span className="inline-block text-turmeric-400 font-semibold text-[10px] xs:text-xs tracking-widest uppercase mb-2 xs:mb-3">
                {slide.eyebrow}
              </span>
              <h1 className="font-display font-extrabold text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-rice-50 leading-tight whitespace-pre-line">
                {slide.title}
              </h1>
              <p className="mt-3 xs:mt-4 text-xs xs:text-sm md:text-base text-rice-100/85 max-w-md">{slide.body}</p>
              <button className="mt-4 xs:mt-6 inline-flex items-center gap-2 rounded-full bg-turmeric-500 hover:bg-turmeric-400 text-leaf-900 font-semibold px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base transition-colors">
                {slide.cta}
              </button>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-2 mt-6 xs:mt-10">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1 xs:h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 xs:w-8 bg-turmeric-400' : 'w-2 xs:w-3 bg-rice-50/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Signature scalloped edge — a banana-leaf border grounding the hero
          in the store's own vernacular instead of a plain rectangle. */}
      <div className="leaf-edge text-leaf-500 dark:text-leaf-600" aria-hidden="true" />
    </div>
  );
}
