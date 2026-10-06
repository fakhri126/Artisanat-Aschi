# ==========================================
# 1. Étape Dépendances
# ==========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ==========================================
# 2. Étape de Build Next.js
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables injectées pendant le build
ARG NEXT_PUBLIC_API_URL=https://artisanat-aschi-backend.onrender.com/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ==========================================
# 3. Image d'Exécution Minimale (Production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_PUBLIC_API_URL=https://artisanat-aschi-backend.onrender.com/api
ENV INTERNAL_BACKEND_URL=https://artisanat-aschi-backend.onrender.com/api
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copie des fichiers statiques et du serveur standalone produit par Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
