# ---- Base runtime (deterministic Node version) ----
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# ---- Dependency installation layer ----
# Copy only package files first (cache-friendly)
COPY package.json pnpm-lock.yaml ./

# Enable pnpm (Node 20 ships with corepack)
RUN corepack enable && pnpm install --frozen-lockfile

# ---- Build layer ----
# Copy source code
COPY . .

# Build TypeScript
RUN pnpm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy only required runtime artifacts
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist

# Expose runtime port (documentation only)
EXPOSE 8000

# Runtime command
CMD ["node", "dist/index.js"]
