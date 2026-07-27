import { useCountUp } from '../hooks/useCountUp.js';

function Stat({ label, value, suffix }) {
  const [ref, animated] = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <p className="price font-display font-extrabold text-2xl xs:text-3xl md:text-4xl text-turmeric-500">
        {animated.toLocaleString('en-IN')}
        {suffix}
      </p>
      <p className="text-xs xs:text-sm text-rice-100/80 mt-1">{label}</p>
    </div>
  );
}

export default function StoreStats({ stats }) {
  return (
    <section className="bg-leaf-500 dark:bg-leaf-600">
      <div className="px-4 xs:px-6 py-8 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}
