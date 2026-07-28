import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/axiosClient.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (value) => {
    if (value.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(value)) return 'Password must include at least one uppercase letter.';
    if (!/[a-z]/.test(value)) return 'Password must include at least one lowercase letter.';
    if (!/[0-9]/.test(value)) return 'Password must include at least one number.';
    return '';
  };

  const handlePasswordChange = (value) => {
    setForm((f) => ({ ...f, password: value }));
    setPasswordError(validatePassword(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passwordValidationMessage = validatePassword(form.password);
    if (passwordValidationMessage) {
      setError(passwordValidationMessage);
      setPasswordError(passwordValidationMessage);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, phone: form.phone?.trim() || undefined };
      await authApi.register(payload);
      setError('');
      setPasswordError('');
      setForm({ name: '', email: '', phone: '', password: '' });
      setShowPassword(false);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] grid place-items-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-card bg-white dark:bg-leaf-600/20 border border-leaf-100/60 dark:border-leaf-400/10 shadow-soft p-8"
      >
        <h1 className="font-display font-bold text-2xl text-leaf-500 dark:text-turmeric-100 text-center">
          Create your account
        </h1>
        <p className="text-sm text-ink-500 dark:text-rice-200/70 text-center mt-1">
          Faster checkout, order tracking, and reorders.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Full name" type="text" required value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <Field label="Email" type="email" required value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
          <Field label="Phone (optional)" type="tel" value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <div className="relative">
            <Field
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={(v) => handlePasswordChange(v)}
              hint="At least 8 characters, with an uppercase letter and a number."
              inputClassName="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((show) => !show)}
              className="absolute inset-y-0 right-3 top-1/2 -translate-y-1/2 text-ink-500"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordError && <p className="text-sm text-kumkum-500">{passwordError}</p>}

          {error && <p className="text-sm text-kumkum-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-leaf-500 hover:bg-leaf-400 disabled:opacity-60 text-white font-semibold py-3 transition-colors"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-ink-500 dark:text-rice-200/70">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-leaf-500 dark:text-turmeric-100 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

function Field({ label, type, value, onChange, required, hint, inputClassName = '' }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded-lg border border-leaf-100 dark:border-leaf-400/30 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2.5 text-sm outline-none focus:border-leaf-400 ${inputClassName}`}
      />
      {hint && <span className="text-xs text-ink-500 dark:text-rice-200/60 mt-1 block">{hint}</span>}
    </label>
  );
}
