cd # Frontend — SELVAM MALIGAI STORE (Phase 4, customer-facing)

React 18 + Vite + Tailwind + Framer Motion. Talks to the real Phase 1
backend for auth (`/api/auth/*`); product/cart/order data is mocked in
`src/data/mockProducts.js` in the exact shape of the Phase 1 `products`
table, ready to swap for real API calls once Phase 2 ships.

## Design tokens

- **Palette**: curry-leaf green (`leaf`), turmeric gold (`turmeric`), kumkum
  red for sale badges (`kumkum`), rice white (`rice`) — grounded in the
  everyday materials of a South Indian provisions store rather than a
  generic storefront theme.
- **Type**: Baloo 2 (display, rounded/friendly), Inter (body), IBM Plex Mono
  (prices — tabular figures so digits don't jitter).
- **Signature**: a scalloped "banana-leaf edge" divider under the hero and
  echoed at the footer, instead of a plain rectangle section break.

## Run it

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173, proxies /api to :5000
```

Run the Phase 1 backend alongside it (`cd ../backend && npm run dev`) to
exercise real login/register — the rest of the homepage renders from mock
data until Phase 2's product API lands.

## What's here

- Sticky header: search, cart with live count, dark/light toggle
- Auto-advancing hero slider
- Category chip scroller
- Product rails: Today's Deals, Featured, Trending, Top Selling, Recently
  Added, Recommended
- Animated store-statistics counters
- Why Choose Us / About Store
- Customer reviews grid
- Newsletter signup
- Sliding cart drawer (sticky cart)
- Login / Register pages wired to the live backend

## Verified

`npm run build` completes cleanly (1930 modules, no errors) and the
production bundle was served and smoke-tested with `npm run preview`.
