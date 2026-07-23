Monorepo with two independent apps, each with its own CLAUDE.md — read that file before working inside it:
- `frontend/` — React 19 + Vite + TypeScript SPA (Redux Toolkit, react-router-dom, Tailwind v4). See [frontend/CLAUDE.md](frontend/CLAUDE.md).
- `backend/` — Express + TypeScript + MongoDB (Mongoose) API. See [backend/CLAUDE.md](backend/CLAUDE.md).

Never scan the full repository tree unless explicitly requested.
Do not read `node_modules/`, `dist/`, `dist-ssr/`, `build/`, `coverage/`, `package-lock.json`, `*.log`, `frontend/logs/`, or `backend/uploads/` in either app — irrelevant to source changes and blocked via `.claude/settings.json` permissions.deny.
Prefer targeted Read/Grep on specific files over broad exploration when the target file is already known.
