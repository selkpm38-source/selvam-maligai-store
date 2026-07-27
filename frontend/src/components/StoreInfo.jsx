import { Truck, Leaf, ShieldCheck, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const reasons = [
  { icon: Truck, title: 'Fast local delivery', body: 'Ordered before 6pm reaches you the same evening across Komarapalayam.' },
  { icon: Leaf, title: 'Sourced fresh', body: 'Rice, spices, and produce sourced weekly from trusted local mills and farms.' },
  { icon: ShieldCheck, title: 'No online payment', body: 'Place your order on WhatsApp and confirm payment directly with our store.' },
  { icon: RotateCcw, title: 'Easy returns', body: 'Not satisfied with a product? Return it within 3 days, no questions asked.' },
];

export function WhyChooseUs() {
  return (
    <section className="px-4 md:px-6 py-12 max-w-5xl mx-auto">
      <h2 className="font-display font-bold text-2xl text-leaf-500 dark:text-turmeric-100 text-center">
        Why shop with Selvam Maligai
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mt-8">
        {reasons.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-card bg-white dark:bg-leaf-600/20 border border-leaf-100/60 dark:border-leaf-400/10 shadow-card p-5 text-center"
          >
            <div className="mx-auto mb-3 grid place-items-center w-11 h-11 rounded-full bg-leaf-50 dark:bg-leaf-400/20 text-leaf-500 dark:text-turmeric-100">
              <r.icon size={20} />
            </div>
            <h3 className="font-semibold text-sm">{r.title}</h3>
            <p className="text-xs text-ink-500 dark:text-rice-200/70 mt-1">{r.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function AboutStore() {
  return (
    <section className="px-4 md:px-6 py-12 bg-rice-200 dark:bg-leaf-900/40">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display font-bold text-2xl text-leaf-500 dark:text-turmeric-100">
          Forty-three years on the same street corner
        </h2>
        <p className="mt-4 text-ink-700 dark:text-rice-200/80 leading-relaxed">
          Selvam Maligai Store started as a single shop counter in Komarapalayam, weighing out rice and
          dal by hand for neighbours who became regulars. We're online now, but the sourcing
          hasn't changed — the same mills, the same spice grinders, the same quality checks
          before anything reaches your door.
        </p>
      </div>
    </section>
  );
}
