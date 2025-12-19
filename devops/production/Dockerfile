# Stage 1: Dependencies (Production only)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl openssl-dev
ENV OPENSSL_ROOT_DIR=/usr
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Builder (with all dependencies)
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl openssl-dev
ENV OPENSSL_ROOT_DIR=/usr
WORKDIR /app

# Copy package files and install ALL dependencies (including dev)
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci && \
    npx prisma generate && \
    npm cache clean --force

# Copy docker-entrypoint.sh first (to ensure it's included)
COPY docker-entrypoint.sh ./

# Copy source code
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Set dummy env vars for build (will be overridden at runtime)
ENV DATABASE_URL="postgresql://eztest:eztest_password@postgres:5432/eztest?schema=public"
ENV NEXTAUTH_SECRET="build-secret-replace-at-runtime"
ENV NEXTAUTH_URL="http://localhost:3000"

# Build Next.js application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl openssl-dev
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV OPENSSL_ROOT_DIR=/usr

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create upload directory
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy all production dependencies from deps stage (needed for Prisma CLI and migrations)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy start script from builder stage (it was copied there earlier)
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
