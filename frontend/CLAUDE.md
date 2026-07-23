Never scan the full frontend directory unless explicitly requested.
Do not read node_modules/, dist/, dist-ssr/, build/, coverage/, package-lock.json, or *.log files — they are irrelevant to source changes and waste tokens. (Also blocked via .claude/settings.json permissions.deny.)
Prefer targeted Read/Grep on specific files over broad exploration when the target file is already known.

## Stack
React 19 + Vite + TypeScript, Redux Toolkit (thunks, not RTK Query), react-router-dom v7, Tailwind v4, axios, socket.io-client.

## src/ structure
- `api/` — `api.ts` (axios instance + interceptors), `tokenManager.ts` (in-memory access token, unauthorized handler)
- `app/` — Redux store + typed hooks
- `features/<domain>/` — one Redux slice per domain (`auth`, `chat`, `mobiles`, `notifications`, `reviews`, `ui`, `userGroup`, `wishlist`), each with `slice.ts` + `selectors.ts` (+ `thunks.ts` for async logic)
- `components/<domain>/` — presentational components grouped by domain (auth, chat, common, dashboard, home, layout, mobile, order, sell)
- `layouts/` — route-level layouts per role/section: Admin, Auth, Buyer, Dashboard, Main, Seller
- `pages/<role>/` — route pages grouped by role (admin, buyer, seller) or domain (auth, chat, mobile, order, static)
- `routes/` — `AppRoutes.tsx`, `generateRoutes.tsx`, `paths.ts`, `ProtectedRoute.tsx` (auth+bootstrapped gate), `RoleBasedRoute.tsx` (role gate)
- `hooks/` — `useAuth`, `useDebounce`, `useVideoCall`
- `lib/socket.ts` — socket.io client singleton
- `types/`, `utils/`, `config/env.ts`

## Auth pattern (already implemented — don't re-implement)
Access token in memory only (`tokenManager.ts`, never localStorage). Refresh token in an httpOnly cookie set by the backend (`withCredentials: true`). Axios response interceptor in `api.ts` auto-refreshes on 401 (deduped via a shared `refreshPromise`) and retries once. `App.tsx` dispatches `bootstrapAuth()` on mount to restore session from the cookie. Session state lives in `features/auth/slice.ts`, consumed via `hooks/useAuth.ts`.

## Code conventions — follow these, don't re-derive per file
- Functional components only: `const Name = (props: NameProps) => { ... }` then `export default Name` at the bottom.
- Props typed via `export interface NameProps { ... }` right above the component; plain `type` aliases for unions/simple shapes.
- 2-space indent, double quotes, semicolons, trailing commas in multiline literals, one blank line max between statements, space before an async arrow's parens (`async () =>`) but not before a named function's (enforced by eslint `spacingRules` — see `eslint.config.js`).
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for everything else (hooks, utils, api, thunks).
- Redux: one folder per domain under `features/<domain>/` — `slice.ts` (createSlice + exported actions/reducer) + `selectors.ts`, and `thunks.ts` for async logic written as hand-rolled `(payload) => async (dispatch) => {...}` thunks (not `createAsyncThunk`).
- Tailwind utility classes inline in JSX; when a component reuses several long class strings, extract them to a local `const classes = { ... }` object at module scope (see `GoogleLoginButton.tsx`).
- Error extraction from API calls goes through a shared `extractError(err)` helper per thunks file, not ad-hoc try/catch messaging.
- Lint with `npm run lint` (oxlint, fast/primary) before calling frontend work done; `npm run lint:eslint` covers the spacing/style rules oxlint doesn't.
