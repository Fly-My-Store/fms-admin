# FMS Admin Web (Next.js + Redux Toolkit + Redux-Saga + Axios + MUI)

**JavaScript** (no TypeScript). Uses Next.js App Router.

## Quick Start
```bash
# 1) Install deps
npm install

# 2) Copy .env.example -> .env.local and set API_BASE_URL
cp .env.example .env.local

# 3) Run
npm run dev
```

### Features
- App Router structure with `/login`, `/dashboard`, `/users`, `/vendors`, `/orders`, `/payouts`
- Redux Toolkit store + Redux-Saga side effects
- Axios API client with bearer token from localStorage
- Basic auth gate: redirect to `/login` if no token
- MUI theme + layout (Sidebar + Topbar)

> This is a starter. Hook real endpoints in `lib/api.js` and sagas under `lib/sagas/*`.
