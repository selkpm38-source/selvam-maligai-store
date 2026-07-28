import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useProducts } from '../context/ProductsContext.jsx';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { items, isOpen, setIsOpen, removeItem, setQuantity, clearCart, subtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const { products } = useProducts();
  // Allow checkout whenever there's at least one item in the cart
  const canCheckout = items.length > 0;

  const sendCheckoutMessage = () => {
    const phoneNumber = '919345786927';
    const itemLines = items
      .map(({ product, quantity }) => `${quantity} x ${product.name} @ ₹${product.sellingPrice}`)
      .join('\n');

    const messageText = `Hello! I would like to place an order from Selvam Maligai Store.\n\nOrder details:\n${itemLines}\n\nSubtotal: ₹${subtotal.toFixed(2)}\n\nNo online payment. Please confirm availability, payment, and delivery details.`;
    const encodedMessage = encodeURIComponent(messageText);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(url, '_blank');
  };

  const handleCheckout = () => {
    // Close the cart and open WhatsApp in a new tab for all users
    setIsOpen(false);
    sendCheckoutMessage();
    // Clear the cart after initiating checkout
    clearCart();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-ink-900/40 z-50"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-rice-50 dark:bg-leaf-900 z-50 flex flex-col shadow-2xl"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between px-4 xs:px-5 py-3 xs:py-4 border-b border-leaf-100/60 dark:border-leaf-400/10">
              <h2 className="font-display font-bold text-base xs:text-lg text-leaf-500 dark:text-turmeric-100">Your Cart</h2>
              <button onClick={() => setIsOpen(false)} aria-label="Close cart" className="p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 xs:px-5 py-3 xs:py-4 space-y-3 xs:space-y-4">
              {items.length === 0 ? (
                <p className="text-xs xs:text-sm text-ink-500 dark:text-rice-200/70 text-center mt-10">
                  Your cart is empty. Add something fresh from the shelves.
                </p>
              ) : (
                items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-2 xs:gap-3 items-start xs:items-center">
                    <div className="grid place-items-center w-12 xs:w-14 h-12 xs:h-14 rounded-lg bg-rice-200 dark:bg-leaf-600/30 text-xl xs:text-2xl shrink-0 overflow-hidden">
                      {typeof product.image === 'string' && product.image.startsWith('data:image') ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{product.image}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs xs:text-sm font-medium truncate">{product.name}</p>
                      <p className="price text-[10px] xs:text-xs text-ink-500 dark:text-rice-200/70">₹{product.sellingPrice} · {product.unit}</p>
                      <div className="flex items-center gap-1.5 xs:gap-2 mt-1">
                        <button
                          onClick={() => setQuantity(product.id, quantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-0.5 xs:p-1 rounded-full border border-leaf-100 dark:border-leaf-400/30"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs xs:text-sm w-4 xs:w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          aria-label="Increase quantity"
                          className="p-0.5 xs:p-1 rounded-full border border-leaf-100 dark:border-leaf-400/30"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      aria-label={`Remove ${product.name}`}
                      className="p-1.5 xs:p-2 text-kumkum-500 hover:bg-kumkum-500/10 rounded-full flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-leaf-100/60 dark:border-leaf-400/10 px-4 xs:px-5 py-3 xs:py-4 space-y-3">
                <div className="flex justify-between text-xs xs:text-sm">
                  <span className="text-ink-500 dark:text-rice-200/70">Subtotal</span>
                  <span className="price font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <p className="rounded-lg bg-turmeric-100/60 dark:bg-turmeric-500/10 px-3 py-2 text-[11px] xs:text-xs text-ink-700 dark:text-rice-100">
                  No online payment. We will confirm payment and delivery details on WhatsApp.
                </p>
                  {canCheckout ? (
                    <button
                      onClick={handleCheckout}
                      className="w-full rounded-full bg-leaf-500 hover:bg-leaf-400 text-white font-semibold py-2.5 xs:py-3 text-sm xs:text-base transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  ) : (
                    <div className="w-full rounded-full bg-ink-200 text-ink-500 font-semibold py-2.5 xs:py-3 text-sm xs:text-base text-center transition-colors dark:bg-ink-700 dark:text-rice-300">
                      Add items to cart to checkout
                    </div>
                  )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
