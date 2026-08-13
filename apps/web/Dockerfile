# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/web/package.json ./

RUN npm install

COPY apps/web ./

# Accept the API URL as a build arg (injected by Railway)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Production Stage (nginx) ----
FROM nginx:alpine AS runner

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for React Router (SPA support)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
