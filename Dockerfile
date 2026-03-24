FROM node:24-alpine AS base

# Set working directory
WORKDIR /app

RUN corepack enable

# Copy only package files first (cache-friendly)
COPY package.json pnpm-lock.yaml ./

# Enable pnpm (Node version ships with corepack)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript TS -> JS
RUN pnpm run build

# ---- Runtime stage ----
FROM node:24-alpine AS runtime

WORKDIR /app

RUN corepack enable

# Copy only package files
COPY package.json pnpm-lock.yaml ./

# Install ONLY production deps
RUN pnpm install --prod --frozen-lockfile

# Copy built app
COPY --from=base /app/dist ./dist


# Expose runtime port (documentation only)
EXPOSE 8000

# Runtime command
CMD ["node", "dist/index.js"]
