# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY apps/api/package.json ./apps/api/

# Install all dependencies (including devDependencies for build)
RUN npm install --workspace=api --include=dev

# Copy source files
COPY apps/api ./apps/api

WORKDIR /app/apps/api

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files for production install
COPY package.json ./
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN npm install --workspace=api --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy Prisma schema + generated client
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma

WORKDIR /app/apps/api

EXPOSE 3001

# Run migrations then start the server
CMD npx prisma migrate deploy && node dist/server.js
