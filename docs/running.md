# Running mfe-accounts

## Prerequisites

- Node 20+ and npm.
- For real data: the SecureBank `api-gateway` reachable at `http://localhost:8080`
  (which fronts account-service and fraud-service). Without it, screens render their
  loading skeletons then error states — the UI itself still works.

## 1. Standalone (own Vite server, port 5171)

```bash
npm install
npm run dev
# open http://localhost:5171  (redirects to /dashboard)
```

- `/api/*` is proxied to `http://localhost:8080` by Vite (see `vite.config.ts`).
- Use the **JWT** button in the top bar to paste an access token from the gateway login.
  It is saved to `localStorage["securebank.token"]` — the same key the shell uses.
- Switch language (EN / हि / मरा) with the selector; it drives `Accept-Language` and money
  formatting.

## 2. Embedded in the shell

1. Build or dev-serve this remote so `assets/remoteEntry.js` is reachable:
   - dev: `npm run dev` (served at `http://localhost:5171/assets/remoteEntry.js`)
   - prod: `npm run build` then serve `dist/` (Docker below).
2. In `securebank-shell`, register the remote and lazy-load the screens:
   ```ts
   remotes: { mfe_accounts: "http://localhost:5171/assets/remoteEntry.js" }
   ```
   ```tsx
   const Dashboard = React.lazy(() => import("mfe_accounts/Dashboard"));
   const Accounts  = React.lazy(() => import("mfe_accounts/Accounts"));
   ```
3. Ensure the shell stores its JWT under `localStorage["securebank.token"]` and/or exposes
   `window.__SECUREBANK__.getToken()`. The remote reads from there automatically.

> The shell and remote must share the same major versions of the singleton packages
> (react, react-dom, react-router-dom, react-i18next, i18next, @reduxjs/toolkit, react-redux).

## 3. Production build

```bash
npm run build      # tsc -b && vite build
# verify the remote entry exists:
test -f dist/assets/remoteEntry.js && echo OK
npm run preview    # serve dist/ at :5171 with CORS
```

## 4. Docker

```bash
docker build -t securebank-mfe-accounts .
docker run -p 5171:80 securebank-mfe-accounts
# remoteEntry.js: http://localhost:5171/assets/remoteEntry.js  (permissive CORS)
```

The nginx image serves the static build, adds permissive CORS on JS/CSS/JSON (so the
cross-origin shell can fetch `remoteEntry.js`), and falls back to `index.html` for
standalone client-side routes.

## Troubleshooting

- **Blank screen when embedded / "Invalid hook call"** → a singleton mismatch; the shell
  loaded a second React. Check both sides declare the same `shared` packages.
- **401 on /api/** → no token in `localStorage["securebank.token"]` (standalone: use the JWT
  button; embedded: confirm the shell wrote the key).
- **CORS error fetching remoteEntry.js in dev** → confirm `server.cors` is enabled (it is)
  and the shell uses the exact `:5171/assets/remoteEntry.js` URL.
```
