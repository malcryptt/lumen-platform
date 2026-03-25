# Stage 1: Build
FROM node:20-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Copy source code and binary
COPY . .

# Build the TypeScript project
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Stage 2: Runtime
FROM node:20-slim AS runtime

# Install runtime dependencies (Prisma needs openssl)
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy only what's needed for production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lumen ./lumen

# Expose the API port
EXPOSE 3001

# Security: Run as non-root
RUN useradd -m lumen && chown -R lumen:lumen /app
USER lumen

# Ensure lumen binary is executable
RUN chmod +x ./lumen

# Start the server
CMD ["node", "dist/server.js"]
