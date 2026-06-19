# ---------------------------------------------------------------------------
# Multi-stage build for the SecureBank Accounts micro-frontend (a MF remote).
#
# Stage 1 builds the static assets (including assets/remoteEntry.js).
# Stage 2 serves them with nginx, adding PERMISSIVE CORS on remoteEntry.js so the
# shell (a different origin) can fetch the federation entry in any environment.
# ---------------------------------------------------------------------------

# ---- Stage 1: build ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first for better layer caching.
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy sources and build. Output lands in /app/dist (incl. assets/remoteEntry.js).
COPY . .
RUN npm run build

# ---- Stage 2: serve ----
FROM nginx:1.27-alpine AS runtime

# Our nginx config adds CORS for the remote entry and SPA fallback for standalone use.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# The shell loads remoteEntry.js over HTTP; container serves on 80 (map to 5171 if desired).
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
