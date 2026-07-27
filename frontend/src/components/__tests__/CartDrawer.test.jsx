import { afterEach, describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';

if (typeof document === 'undefined') {
  const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.window = jsdom.window;
  Object.defineProperty(globalThis, 'document', {
    value: jsdom.window.document,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'navigator', {
    value: jsdom.window.navigator,
    configurable: true,
  });
  globalThis.HTMLElement = jsdom.window.HTMLElement;
  globalThis.SVGElement = jsdom.window.SVGElement;
  globalThis.MutationObserver = jsdom.window.MutationObserver;
  globalThis.getComputedStyle = jsdom.window.getComputedStyle;
  globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { name: 'Test User' }, logout: vi.fn() }),
}));

vi.mock('../../context/ProductsContext.jsx', () => ({
  useProducts: () => ({
    products: [
      { id: 'p1', name: 'Ponni Boiled Rice', category: 'Rice & Grains', unit: '10 kg' },
      { id: 'p2', name: 'Toor Dal', category: 'Dals & Pulses', unit: '1 kg' },
    ],
  }),
}));

let cartState = {
  items: [
    { product: { id: 'p1', name: 'Ponni Boiled Rice', sellingPrice: 100, unit: '10 kg', image: 'R' }, quantity: 1 },
    { product: { id: 'p2', name: 'Toor Dal', sellingPrice: 80, unit: '1 kg', image: 'D' }, quantity: 1 },
  ],
  isOpen: true,
  setIsOpen: vi.fn(),
  removeItem: vi.fn(),
  setQuantity: vi.fn(),
  subtotal: 180,
};

const useCartMock = vi.fn(() => cartState);

vi.mock('../../context/CartContext.jsx', () => ({
  useCart: () => useCartMock(),
}));

const { cleanup, render, screen } = await import('@testing-library/react');
const { MemoryRouter } = await import('react-router-dom');
const { default: CartDrawer } = await import('../CartDrawer.jsx');

const renderCartDrawer = () => render(
  <MemoryRouter>
    <CartDrawer />
  </MemoryRouter>
);

afterEach(() => cleanup());

describe('CartDrawer checkout visibility', () => {
  it('shows checkout button only when all products are in cart', async () => {
    cartState = {
      items: [
        { product: { id: 'p1', name: 'Ponni Boiled Rice', sellingPrice: 100, unit: '10 kg', image: 'R' }, quantity: 1 },
        { product: { id: 'p2', name: 'Toor Dal', sellingPrice: 80, unit: '1 kg', image: 'D' }, quantity: 1 },
      ],
      isOpen: true,
      setIsOpen: vi.fn(),
      removeItem: vi.fn(),
      setQuantity: vi.fn(),
      subtotal: 180,
    };
    useCartMock.mockImplementation(() => cartState);

    renderCartDrawer();

    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeTruthy();
    expect(screen.queryByText(/add all items to cart to checkout/i)).toBeNull();
  });

  it('hides checkout button when not all products are added', async () => {
    cartState = {
      items: [
        { product: { id: 'p1', name: 'Ponni Boiled Rice', sellingPrice: 100, unit: '10 kg', image: 'R' }, quantity: 1 },
      ],
      isOpen: true,
      setIsOpen: vi.fn(),
      removeItem: vi.fn(),
      setQuantity: vi.fn(),
      subtotal: 100,
    };
    useCartMock.mockImplementation(() => cartState);

    renderCartDrawer();

    expect(screen.getByText(/add all items to cart to checkout/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /proceed to checkout/i })).toBeNull();
  });
});
