# ---- Build Stage ----
# Use node:20-slim (Debian-based) — Alpine lacks OpenSSL which Prisma requires
FROM node:20-slim AS builder

# Install OpenSSL for Prisma schema engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root + API package files
COPY package.json ./
COPY apps/api/package.json ./apps/api/

# Install dependencies (including devDeps for build)
RUN npm install --workspace=api

# Copy all API source files
COPY apps/api ./apps/api

WORKDIR /app/apps/api

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript to dist/
RUN npm run build

# ---- Production Stage ----
FROM node:20-slim AS runner

# Install OpenSSL for Prisma at runtime too
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json ./
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN npm install --workspace=api --omit=dev

# Copy compiled output
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy Prisma schema and generated client
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

WORKDIR /app/apps/api

EXPOSE 10000

# Run DB migrations then start server
CMD npx prisma migrate deploy && node dist/server.js
