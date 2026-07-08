# Mobile Sales — Backend

Production-oriented REST + realtime API for a second-hand mobile phone marketplace (buyer / seller / admin roles). This is **Milestone 1: backend only** — data layer, all REST APIs, and the full Socket.IO chat/signaling system. The frontend (React/Redux/Tailwind) is a separate follow-up milestone.

## Stack

Node.js, Express, MongoDB/Mongoose, JWT auth, Socket.IO, Multer, Joi validation, Helmet/rate-limiting/mongo-sanitize/xss/hpp for security.

## Getting started

```bash
cp .env.example .env      # edit values as needed
npm install
npm run seed               # creates an admin, a demo seller/buyer, sample listings, a coupon
npm run dev                 # nodemon, http://localhost:5000
```

Requires a running MongoDB instance (`MONGO_URI`). Everything else is optional — see below.

## External integrations: stubbed behind adapters

Razorpay, AWS S3, Google OAuth, SMTP email, and SMS/OTP all require real accounts this environment doesn't have. Each lives behind a service adapter in `src/services/` that **falls back to a working mock/local implementation when unconfigured**, so the whole app runs end-to-end out of the box:

| Integration | Configured via | Unconfigured fallback |
|---|---|---|
| AWS S3 (`storage.service.js`) | `AWS_*`, `AWS_S3_BUCKET` | Saves files to `backend/uploads/`, served at `/uploads/...` |
| Razorpay (`payment.service.js`) | `RAZORPAY_KEY_ID/SECRET` | Mock order IDs, signature verification always passes |
| Google OAuth (`googleAuth.service.js`) | `GOOGLE_CLIENT_ID` | Google login endpoint returns 400 until configured |
| SMTP (`email.service.js`) | `SMTP_*` | Emails logged to console instead of sent |
| SMS/OTP (`sms.service.js`) | `SMS_API_KEY` | OTP logged to console instead of texted |
| Redis cache (`cache.service.js`) | `REDIS_URL` | Cache calls no-op; app works without caching |

Drop in real credentials in `.env` at any time — no code changes required.

## Auth

JWT access token (short-lived, `Authorization: Bearer`) + rotating refresh token (httpOnly cookie, scoped to `/api/auth`, also DB-tracked for revocation on logout/password reset). Supports register/login, Google login, mobile OTP login, email verification, forgot/reset password, change password.

## Realtime (Socket.IO)

Connect with `{ auth: { token: <accessToken> } }`. REST endpoints persist messages (so uploads/validation share one path); sockets handle the realtime layer:

- `conversation:join` / `conversation:leave`
- `typing:start` / `typing:stop`
- `message:read` — marks unread messages read, emits receipt
- `message:new`, `notification:new`, `presence:online` / `presence:offline` — server → client pushes
- `call:invite` / `call:answer` / `call:ice-candidate` / `call:end` / `call:decline` — WebRTC signaling relay for video calls (media itself is negotiated peer-to-peer client-side)

## API surface

All routes are mounted under `/api`:

`auth`, `users`, `mobiles`, `wishlist`, `orders`, `payments`, `reviews`, `coupons`, `reports` (+ `/reports/disputes`), `chat`, `notifications`, `dashboard` (`/seller`, `/buyer`, `/admin`), `admin` (`/revenue`, `/analytics/sales`).

Admin-only actions (listing approval, IMEI verification, seller verification review, user block/unblock, report/dispute resolution, order oversight) live alongside their resource under an `/admin` sub-path or an `authorize(ROLES.ADMIN)` guard, rather than being duplicated in a separate module.

## Seed data

`npm run seed` creates:
- Admin: value of `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` (defaults `admin@mobilesales.local` / `Admin@12345`)
- Demo seller: `seller.demo@mobilesales.local` / `Seller@12345` (pre-verified, 5 sample listings)
- Demo buyer: `buyer.demo@mobilesales.local` / `Buyer@12345`
- Coupon: `WELCOME100`

`npm run seed:destroy` wipes users/listings/coupons.
