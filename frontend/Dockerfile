# Stage 1: Build Angular application
FROM node:20-alpine AS builder
WORKDIR /app

ENV CI=true

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Nginx runtime image
FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/frontend /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget --no-verbose --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
