# -------- Build stage --------
FROM node:22-slim AS builder
WORKDIR /app

COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm install

WORKDIR /app
COPY . .

WORKDIR /app/client
RUN npm run build


# -------- Production stage --------
FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html

EXPOSE 80