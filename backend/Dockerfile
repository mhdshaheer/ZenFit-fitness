# Stage 1: Base image
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Install all dependencies & build app
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Install only production dependencies
FROM base AS prod-deps
RUN npm ci --omit=dev

# Stage 4: Final production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production node_modules + build output
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Expose backend port
EXPOSE 5001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5001), res => { if (res.statusCode < 400) process.exit(0); process.exit(1); }).on('error', () => process.exit(1));"

# Start backend
CMD ["node", "dist/server.js"]
