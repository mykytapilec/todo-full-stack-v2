# -------- Stage 1: Build --------
FROM node:22-slim AS builder
WORKDIR /app

COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

WORKDIR /app
COPY . .

WORKDIR /app/server
RUN npm run build


FROM node:22-slim
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package*.json ./

RUN npm install --omit=dev

EXPOSE 8080

CMD ["node", "dist/server/src/index.js"]