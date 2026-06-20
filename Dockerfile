FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.output /app/.output

RUN mkdir -p /data

ENV NODE_ENV=production
ENV DB_PATH=/data/app.db
ENV NUXT_SESSION_PASSWORD=change-me-to-a-32-char-secret-min

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
