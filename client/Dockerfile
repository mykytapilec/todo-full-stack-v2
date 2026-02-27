# Stage 1: build
FROM node:22-slim AS builder

WORKDIR /app

COPY client/package*.json ./client/

WORKDIR /app/client
RUN npm install

WORKDIR /app
COPY tsconfig.base.json ./
COPY shared ./shared
COPY client ./client

WORKDIR /app/client
RUN npm run build


# Stage 2: production image
FROM nginx:alpine

COPY --from=builder /app/client/dist /usr/share/nginx/html

COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]