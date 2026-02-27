# ---------- Build Stage ----------
FROM node:22 AS builder

WORKDIR /app

# Copy all files to the container
COPY . .

# Go to server directory
WORKDIR /app/server

# Install dependencies
RUN npm install

# Build the server
RUN npm run build


# ---------- Production Stage ----------
FROM node:22-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY --from=builder /app/server/package*.json ./

# Install prod deps
RUN npm install --omit=dev

# Copy dist
COPY --from=builder /app/server/dist ./dist

EXPOSE 8080

CMD ["node", "dist/server/src/index.js"]