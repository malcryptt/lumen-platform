FROM node:20-slim

# Install OpenSSL (required by Prisma)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and prisma schema first
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (triggers prisma generate)
RUN npm install

# Copy remaining source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Remove devDependencies
RUN npm prune --production

EXPOSE 3002

# Security: Run as non-root
RUN useradd -m lumen && chown -R lumen:lumen /app
USER lumen

CMD ["node", "dist/server.js"]
