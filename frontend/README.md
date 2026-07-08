# Mobile Sales — Frontend

React 19 + Vite + Redux Toolkit + React Router + Tailwind CSS v4 + Axios + Socket.IO client. Consumes the backend API in `../backend`.

## Getting started

```bash
cp .env.example .env      # defaults to http://localhost:5000/api — edit if your backend runs elsewhere
npm install
npm run dev                # http://localhost:5173, proxies /api and /uploads to the backend
```

Log in with the seeded demo accounts from the backend (`npm run seed` in `../backend`):
- Buyer: `buyer.demo@mobilesales.local` / `Buyer@12345`
- Seller: `seller.demo@mobilesales.local` / `Seller@12345`
- Admin: `admin@mobilesales.local` / `Admin@12345`

## Structure

- `src/api/` — one module per backend resource, thin wrappers around a shared Axios instance
- `src/app/store.js` — Redux Toolkit store; slices for `auth`, `wishlist`, `notifications`, `chat`, `ui` (theme)
- `src/features/` — the slices themselves
- `src/lib/socket.js` + `src/components/common/SocketManager.jsx` — single Socket.IO connection lifecycle, fans events into Redux
- `src/hooks/useVideoCall.js` — WebRTC signaling over the chat socket for video calls
- `src/layouts/` — `MainLayout` (navbar/footer), `AuthLayout`, and per-role dashboard shells (`BuyerLayout`, `SellerLayout`, `AdminLayout`)
- `src/routes/ProtectedRoute.jsx` — auth + role gating
- `src/pages/` — routed pages, grouped by area (`auth`, `mobile`, `chat`, `buyer`, `seller`, `admin`, `order`, `static`)
- `src/components/` — shared UI (`common`), and area-specific pieces (`mobile`, `chat`, `sell`, `order`, `dashboard`, `layout`)

## Notable implementation choices

- **Access token in memory only** (`src/api/tokenManager.js`), refresh token in an httpOnly cookie set by the backend — the access token is never in localStorage, so it isn't readable by an XSS payload. `bootstrapAuth` calls `/auth/refresh-token` on page load to restore a session.
- **Search state lives in the URL** (`useSearchParams`) rather than Redux, so filtered/sorted search results are shareable and back-button friendly.
- **360° view** on the product page reuses the seller's own uploaded photos (drag to cycle through them) rather than requiring a dedicated 360° capture flow.
- **Price history chart** is a small hand-rolled SVG sparkline — no charting library needed for one line.
- **Video calls** are peer-to-peer WebRTC; the existing chat socket only relays SDP/ICE signaling (`call:invite/answer/ice-candidate/end/decline`), matching what the backend already exposes.
- **Payments**: when the backend has no real Razorpay keys configured, `paymentsApi.createOrder` returns a mock order and checkout completes without loading the Razorpay widget. Real keys make the actual Razorpay checkout.js flow kick in automatically.

## Known limitations

- No automated test suite yet (Vitest/RTL would be the natural next addition).
- Bundle isn't code-split (single ~550KB JS chunk) — fine for this stage, but route-level `lazy()` splitting would help before a real production deploy.
- UI was verified via `npm run build` (compiles clean) and manual API/proxy checks from this environment; it has not been visually verified in an actual browser here — do a click-through pass before shipping.
