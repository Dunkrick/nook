# ---------- Builder ----------
FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# ---------- Runtime ----------
FROM node:22-slim AS production

WORKDIR /app

RUN apt-get update && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3003

CMD ["node", "dist/server.js"]