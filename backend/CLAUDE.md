Never scan the full backend directory unless explicitly requested.
Do not read node_modules/, dist/, build/, coverage/, package-lock.json, uploads/, or *.log files — they are irrelevant to source changes and waste tokens. (Also blocked via .claude/settings.json permissions.deny.)
Prefer targeted Read/Grep on specific files over broad exploration when the target file is already known.

## Stack
Express + TypeScript (commonjs), MongoDB via Mongoose, JWT auth (jsonwebtoken), Redis (ioredis) for caching, Socket.IO, Joi validation, Razorpay payments, Cloudinary/S3 for media.

## src/ structure (one file per domain, consistently named)
- `controllers/<domain>.controller.ts` — request handlers (auth, admin, chat, coupon, dashboard, mobile, notification, order, payment, report, review, upload, user, wishlist)
- `routes/<domain>.routes.ts` — route definitions, aggregated in `routes/index.ts`
- `validations/<domain>.validation.ts` — Joi schemas per domain
- `models/` — Mongoose models (User, Mobile, Order, Payment, Review, Message, Conversation, Notification, Coupon, Dispute, Report, Settings, Wishlist), aggregated in `models/index.ts`
- `middleware/` — `auth.middleware.ts` (JWT verify), `role.middleware.ts`, `validate.middleware.ts`, `error.middleware.ts`, `security.middleware.ts`, `rateLimiter.middleware.ts`, `upload.middleware.ts` / `cloudinaryUpload.middleware.ts`
- `services/` — business logic used by controllers: `token.service.ts` (JWT issue/verify), `googleAuth.service.ts`, `email.service.ts`, `sms.service.ts`, `payment.service.ts`, `cache.service.ts`, `notification.service.ts`, `storage.service.ts`, `cloudinaryUpload.service.ts`, `priceSuggestion.service.ts`, `settings.service.ts`
- `sockets/` — Socket.IO setup + `chatSocket.ts`
- `config/` — `env.ts`, `db.ts`, `redis.ts`, `cloudinary.ts`, `constants.ts`
- `types/` — shared TS types (`express.ts` extends `Request.user`, `models.ts`, `constants.ts`, `env.ts`, `socket.ts`)
- `utils/` — `ApiError.ts`, `asyncHandler.ts`, `logger.ts`, `otp.ts`, `pagination.ts`
- `seed/` — DB seed script + fixture data

## Auth pattern (already implemented — don't re-implement)
`auth.controller.ts` issues a short-lived access token (JWT, returned in response body) + a long-lived refresh token stored **httpOnly/Secure/SameSite cookie** scoped to `/api/auth`, persisted per-user in `User.refreshTokens[]` with device metadata and **rotated** on every `/auth/refresh-token` call (old token deleted, new pair issued). `auth.middleware.ts` verifies the access token per-request via `authenticateToken` (or `optionalAuth` for public-with-optional-user routes). Password reset invalidates all refresh tokens.

## Code conventions — follow these, don't re-derive per file
- 2-space indent, double quotes, semicolons, trailing commas in multiline literals, one blank line max between statements (enforced by eslint `spacingRules` in `eslint.config.mjs`).
- File naming: one file per domain per layer, same domain name across layers — `<domain>.controller.ts`, `<domain>.routes.ts`, `<domain>.validation.ts` (e.g. `auth.controller.ts` / `auth.routes.ts` / `auth.validation.ts`).
- Controllers: named exported async functions, `export const actionName = async (req: Request<...>, res: Response) => { ... }` — never default-exported.
- Request body shapes declared as a local `interface ActionNameBody { ... }` immediately above the handler that uses it, not in a shared types file.
- Every controller action wraps its logic in try/catch and delegates failures to the shared `sendError(res, "do the thing", error)` helper (see `auth.controller.ts`) rather than writing bespoke catch blocks.
- Response JSON always has the shape `{ flag: "success" | "error", data, message? }` — keep new endpoints consistent with this envelope.
- `services/` hold business logic called from controllers, imported as a namespace: `import * as tokenService from "../services/token.service"`, and export plain named functions (no classes).
- Validation via Joi in `validations/<domain>.validation.ts`, wired through `validate.middleware.ts`.
- Mongoose models live in `models/`, one file per model, aggregated in `models/index.ts`.
- Lint with `npm run lint` (eslint) before calling backend work done.
