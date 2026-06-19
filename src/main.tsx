/**
 * STANDALONE entry point (index.html -> /src/main.tsx).
 *
 * Module Federation in Vite requires the app's initialization to run AFTER the shared-scope
 * runtime is ready. The idiomatic pattern is to keep this file a one-line DYNAMIC import of
 * the real bootstrap — that defers execution past the federation runtime init. When this
 * package is consumed as a remote, the shell never loads main.tsx at all; it loads
 * remoteEntry.js and imports the exposed modules directly.
 */
void import("./bootstrap");
