import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Sun, Moon, Menu, X, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import { getMatchingProducts } from '../utils/productSearch.js';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { itemCount, setIsOpen } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { products } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  const suggestions = useMemo(() => getMatchingProducts(products, query).slice(0, 6), [products, query]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get('search') ?? '');
  }, [location.search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applySearch = (nextQuery = query, selectedId = null, shouldHideSuggestions = true) => {
    const params = new URLSearchParams(location.search);
    const trimmedQuery = nextQuery.trim();

    if (trimmedQuery) {
      params.set('search', trimmedQuery);
    } else {
      params.delete('search');
    }

    if (selectedId) {
      params.set('selected', selectedId);
    } else {
      params.delete('selected');
    }

    navigate({ pathname: '/', search: params.toString() ? `?${params.toString()}` : '' });
    if (shouldHideSuggestions) {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    applySearch(query, null, false);
  };

  const handleSelectProduct = (product) => {
    setQuery(product.name);
    applySearch(product.name, product.id);

    window.setTimeout(() => {
      document.getElementById(`product-${product.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 160);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-leaf-100/60 bg-rice-50/90 backdrop-blur dark:bg-leaf-900/90 dark:border-leaf-400/20">
      {/* Top strip: delivery location, quick note */}
      <div className="hidden md:flex items-center justify-between px-6 py-1.5 text-xs text-leaf-600 dark:text-turmeric-100 bg-leaf-50 dark:bg-leaf-600/40">
        <span className="flex items-center gap-1">
          <MapPin size={12} /> Delivering to Komarapalayam, Tamil Nadu
        </span>
        <span>Free delivery on orders above ₹499</span>
      </div>

      <div ref={searchRef}>
        <div className="flex items-center gap-3 px-4 md:px-6 py-3">
          <button
            className="md:hidden p-2 -ml-2"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={handleNavClick}>
            <span className="grid place-items-center w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-leaf-500 text-turmeric-100 font-display font-bold text-base sm:text-lg">
              SM
            </span>
            <span className="font-display font-bold text-sm sm:text-lg md:text-xl text-leaf-500 dark:text-turmeric-100 leading-none">
              Selvam Maligai Store
              <span className="block text-[9px] sm:text-[11px] font-display font-medium tracking-wide text-ink-500 dark:text-rice-200">
                Wholesale &amp; Retail
              </span>
            </span>
          </Link>

          {/* Search */}
          <div className="hidden sm:flex flex-1 max-w-xl mx-2 relative">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <label className="relative w-full block">
                <span className="sr-only">Search products</span>
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  value={query}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setQuery(nextValue);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  type="search"
                  placeholder="Search for rice, dal, spices..."
                  className="w-full rounded-full border border-leaf-100 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none focus:border-leaf-400 dark:bg-leaf-600/30 dark:border-leaf-400/30 dark:text-rice-100 dark:placeholder:text-rice-200/60"
                />
              </label>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-leaf-100 bg-white shadow-lg dark:border-leaf-400/20 dark:bg-leaf-700">
                {suggestions.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectProduct(product)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-leaf-50 dark:text-rice-100 dark:hover:bg-leaf-600/50"
                    >
                      <span>
                        <span className="block font-medium">{product.name}</span>
                        <span className="text-xs text-ink-500 dark:text-rice-200/70">{product.category} · {product.unit}</span>
                      </span>
                      <span className="text-xs font-semibold text-leaf-500">Select</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-1 md:gap-2 ml-auto">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full hover:bg-leaf-100 dark:hover:bg-leaf-400/20 transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isAuthenticated ? (
            <>
              {user?.email === 'owner@selvammaligai.store' ? (
                <Link
                  to="/manager"
                  className="hidden sm:inline-flex text-sm font-medium px-3 py-2 rounded-full hover:bg-leaf-100 dark:hover:bg-leaf-400/20 transition-colors"
                >
                  Manage products
                </Link>
              ) : null}
              <button
                onClick={logout}
                className="hidden sm:inline-flex text-sm font-medium px-3 py-2 rounded-full hover:bg-leaf-100 dark:hover:bg-leaf-400/20 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-medium px-3 py-2 rounded-full hover:bg-leaf-100 dark:hover:bg-leaf-400/20 transition-colors"
            >
              Login
            </Link>
          )}

          <button
            onClick={() => setIsOpen(true)}
            aria-label={`Cart, ${itemCount} items`}
            className="relative p-2 rounded-full hover:bg-leaf-100 dark:hover:bg-leaf-400/20 transition-colors"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-kumkum-500 text-white text-[10px] font-semibold">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <label className="relative w-full block">
            <span className="sr-only">Search products</span>
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={query}
              onChange={(e) => {
                const nextValue = e.target.value;
                setQuery(nextValue);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              type="search"
              placeholder="Search for rice, dal, spices..."
              className="w-full rounded-full border border-leaf-100 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-leaf-400 dark:bg-leaf-600/30 dark:border-leaf-400/30 dark:text-rice-100"
            />
          </label>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-leaf-100 bg-white shadow-lg dark:border-leaf-400/20 dark:bg-leaf-700">
              {suggestions.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelectProduct(product)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-leaf-50 dark:text-rice-100 dark:hover:bg-leaf-600/50"
                  >
                    <span>
                      <span className="block font-medium">{product.name}</span>
                      <span className="text-xs text-ink-500 dark:text-rice-200/70">{product.category} · {product.unit}</span>
                    </span>
                    <span className="text-xs font-semibold text-leaf-500">Select</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-leaf-100/60 dark:border-leaf-400/20 bg-white dark:bg-leaf-600/30">
          <div className="px-4 py-3 space-y-2">
            {isAuthenticated ? (
              <>
                {user?.email === 'owner@selvammaligai.store' && (
                  <Link
                    to="/manager"
                    onClick={handleNavClick}
                    className="block text-sm font-medium px-4 py-2 rounded-lg hover:bg-leaf-100 dark:hover:bg-leaf-400/20 transition-colors"
                  >
                    Manage products
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    handleNavClick();
                  }}
                  className="w-full text-left text-sm font-medium px-4 py-2 rounded-lg hover:bg-leaf-100 dark:hover:bg-leaf-400/20 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={handleNavClick}
                className="block text-sm font-medium px-4 py-2 rounded-lg hover:bg-leaf-100 dark:hover:bg-leaf-400/20 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
    </header>
  );
}
