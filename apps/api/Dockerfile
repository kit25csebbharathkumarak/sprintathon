# ---- Build Stage ----
FROM node:20-alpine AS builder

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
FROM node:20-alpine AS runner

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

EXPOSE 3001

# Run DB migrations then start server
CMD npx prisma migrate deploy && node dist/server.js
