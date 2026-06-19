import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import path from "node:path";

/**
 * Vite config for the SecureBank Accounts micro-frontend.
 *
 * This package is a Module Federation **REMOTE**. The SecureBank `shell` (the host) loads
 * our `remoteEntry.js` at runtime and renders the modules we expose. We never bundle React,
 * the router, i18n or the Redux runtime into the federated chunks — those are declared as
 * `shared` SINGLETONS so the remote reuses the EXACT SAME instances the shell already loaded.
 * Reusing singletons is what makes React context (and therefore i18n, Redux Provider, the
 * router) work across the federation boundary: two copies of React would each have their own
 * context registry and hooks would explode at runtime.
 */
export default defineConfig({
  plugins: [
    react(),
    federation({
      // The remote's global name. The shell references us as `mfe_accounts` in its own
      // federation `remotes` map, e.g. mfe_accounts: "http://localhost:5171/assets/remoteEntry.js".
      name: "mfe_accounts",

      // Conventional filename the host expects. Emitted into the build output (assets/).
      filename: "remoteEntry.js",

      // The modules we expose to the host. Each maps a public import path -> a source module
      // whose DEFAULT export is a React component. The shell does:
      //   const Dashboard = React.lazy(() => import("mfe_accounts/Dashboard"));
      //   const Accounts  = React.lazy(() => import("mfe_accounts/Accounts"));
      exposes: {
        "./Dashboard": "./src/exposes/Dashboard.tsx",
        "./Accounts": "./src/exposes/Accounts.tsx",
      },

      // Shared SINGLETON dependencies. `singleton: true` forces one instance across host +
      // all remotes (no duplicate React/Redux). We pin loose ranges so the shell's version
      // satisfies us; `requiredVersion: false` keeps us tolerant when the shell ships a
      // slightly different patch — the shell is the source of truth for these.
      //
      // NOTE: `singleton` is honored by the plugin's runtime but its key is commented out in
      // the shipped TS typings, so we cast to keep the intent AND compile cleanly.
      shared: {
        react: { singleton: true, requiredVersion: false },
        "react-dom": { singleton: true, requiredVersion: false },
        "react-router-dom": { singleton: true, requiredVersion: false },
        "react-i18next": { singleton: true, requiredVersion: false },
        i18next: { singleton: true, requiredVersion: false },
        "@reduxjs/toolkit": { singleton: true, requiredVersion: false },
        "react-redux": { singleton: true, requiredVersion: false },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    }),
  ],

  resolve: {
    alias: {
      // shadcn/ui convention: `@/...` -> src/...
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Module Federation in Vite relies on top-level await in the generated entry, so the
  // whole graph must target a modern baseline.
  build: {
    target: "esnext",
    // Keep module preloading off; the host orchestrates remote loading itself.
    modulePreload: false,
    cssCodeSplit: false,
  },

  server: {
    port: 5171,
    strictPort: true,
    // CORS must be enabled so the shell (origin :5170) can fetch our remoteEntry.js in dev.
    cors: true,
    proxy: {
      // STANDALONE dev only: proxy /api to the gateway so the remote works on its own at :5171
      // without CORS headaches. When embedded, the shell's origin serves /api instead.
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 5171,
    strictPort: true,
    cors: true,
  },
});
