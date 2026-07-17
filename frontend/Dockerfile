# ---------- 1️⃣ Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package configurations for workspaces
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install dependencies for all workspaces
RUN npm ci

# Copy the actual source code
COPY shared ./shared
COPY frontend ./frontend

# Build the shared library first, then the frontend
RUN npm run build --workspace=shared
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=frontend

# ---------- 2️⃣ Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set permissions for prerender cache
RUN mkdir -p /app/frontend/.next
RUN chown nextjs:nodejs /app/frontend/.next

COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

# Automatically leverage output traces to reduce image size
# The standalone build retains the workspace directory structure
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "frontend/server.js"]
