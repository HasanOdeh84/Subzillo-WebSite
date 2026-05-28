# ── Build stage ───────────────────────────────────────────────
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# ── Runtime stage ─────────────────────────────────────────────
FROM node:20-slim
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application files (static assets + server)
COPY server.js        ./
COPY components.js    ./
COPY index.html       ./
COPY privacy.html     ./
COPY terms.html       ./
COPY logo-transparent.png ./
COPY logo-favicon.png     ./
COPY og-image.png         ./
COPY og-image.svg         ./
COPY favicon.svg          ./

# Cloud Run sets PORT automatically (default 8080)
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
