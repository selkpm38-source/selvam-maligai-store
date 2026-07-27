import { useState } from 'react';
import { Mail, Check } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="px-4 md:px-6 py-14">
      <div className="max-w-xl mx-auto text-center">
        <Mail className="mx-auto text-leaf-500 dark:text-turmeric-100" size={28} />
        <h2 className="font-display font-bold text-2xl mt-3 text-leaf-500 dark:text-turmeric-100">
          Get notified about fresh stock &amp; offers
        </h2>
        <p className="text-sm text-ink-500 dark:text-rice-200/70 mt-2">
          One email a week. New arrivals, seasonal offers, nothing else.
        </p>

        {submitted ? (
          <p className="mt-6 inline-flex items-center gap-2 text-leaf-500 dark:text-turmeric-100 font-medium">
            <Check size={18} /> You're subscribed — welcome aboard.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-full border border-leaf-100 dark:border-leaf-400/30 bg-white dark:bg-leaf-600/20 px-5 py-3 text-sm outline-none focus:border-leaf-400 min-w-[260px]"
            />
            <button
              type="submit"
              className="rounded-full bg-leaf-500 hover:bg-leaf-400 text-white font-semibold px-6 py-3 transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
