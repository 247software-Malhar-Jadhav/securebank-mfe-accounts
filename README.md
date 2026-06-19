# securebank-mfe-accounts

The **Accounts micro-frontend** for the SecureBank platform — a Module Federation **remote**
that owns the **Dashboard** and **Accounts** screens. It is consumed by `securebank-shell`
(the host) and also runs **standalone** in dev on port **5171**.

> Part of the SecureBank microservices platform. See `../MICROSERVICES_SPEC.md` §5.

## What it exposes (the remote contract)

| Federation name | Source | Default export |
|---|---|---|
| `mfe_accounts/Dashboard` | `src/exposes/Dashboard.tsx` | `<Dashboard/>` React component |
| `mfe_accounts/Accounts`  | `src/exposes/Accounts.tsx`  | `<Accounts/>` React component |

- Remote name: `mfe_accounts` · entry: `remoteEntry.js` · build target: `esnext`.
- The shell registers us as e.g.
  `mfe_accounts: "http://localhost:5171/assets/remoteEntry.js"` and lazy-loads the modules.

## Shared singletons

`react`, `react-dom`, `react-router-dom`, `react-i18next`, `i18next`, `@reduxjs/toolkit`,
`react-redux` are declared as **singletons** so the remote reuses the shell's exact instances
(one React context, one Redux Provider, one i18n instance, one router). See `vite.config.ts`.

## Auth contract (standalone vs embedded)

The RTK Query slice reads the JWT at request time from a **shared channel** so the `Bearer`
header works in both modes (see `src/lib/auth.ts`):

1. `window.__SECUREBANK__.getToken()` — preferred when embedded (freshest token).
2. `localStorage["securebank.token"]` — the durable shared key (used standalone + fallback).

`Accept-Language` is always set from the live i18next language.

## Tech stack

React 18 · TypeScript 5 · Vite · `@originjs/vite-plugin-federation` · Redux Toolkit + RTK
Query · shadcn/ui on Tailwind · react-i18next (en/hi/mr) · recharts · lucide-react.

## Quick start

```bash
npm install
npm run dev      # standalone dev harness at http://localhost:5171
npm run build    # production build -> dist/ (incl. assets/remoteEntry.js)
npm run preview  # serve the built remote
```

Standalone dev proxies `/api` → `http://localhost:8080` (the gateway). Use the **JWT** button
in the dev top bar to paste a token obtained from the gateway login.

## Docs

- `docs/mfe-accounts.md` — exposes, remote contract, auth consumption, standalone vs embedded,
  architecture diagram.
- `docs/running.md` — how to run standalone, embedded, and via Docker.

## Docker

```bash
docker build -t securebank-mfe-accounts .
docker run -p 5171:80 securebank-mfe-accounts   # remoteEntry.js served with permissive CORS
```
