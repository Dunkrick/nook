FROM node:22-slim

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN apt-get update -y && apt-get install -y openssl

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3003

CMD ["npm", "start"]