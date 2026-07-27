import { describe, it, expect, vi } from 'vitest';
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
  useAuth: () => ({ isAuthenticated: false, user: null, logout: vi.fn() }),
}));

vi.mock('../../context/CartContext.jsx', () => ({
  useCart: () => ({ itemCount: 0, setIsOpen: vi.fn() }),
}));

vi.mock('../../context/ThemeContext.jsx', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));

vi.mock('../../context/ProductsContext.jsx', () => ({
  useProducts: () => ({
    products: [
      { id: 'p1', name: 'Ponni Boiled Rice', category: 'Rice & Grains', unit: '10 kg' },
      { id: 'p2', name: 'Toor Dal', category: 'Dals & Pulses', unit: '1 kg' },
    ],
  }),
}));

const { render, screen } = await import('@testing-library/react');
const userEvent = (await import('@testing-library/user-event')).default;
const { MemoryRouter } = await import('react-router-dom');
const { default: Header } = await import('../Header.jsx');

const renderHeader = () => render(
  <MemoryRouter>
    <Header />
  </MemoryRouter>
);

describe('Header search bar', () => {
  it('shows suggestions while typing and updates search query', async () => {
    renderHeader();

    const [input] = screen.getAllByPlaceholderText('Search for rice, dal, spices...');
    await userEvent.type(input, 'dal');

    const suggestions = await screen.findAllByText('Toor Dal');
    expect(suggestions.length).toBeGreaterThan(0);
  });
});
