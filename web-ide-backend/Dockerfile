FROM node:20-slim

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and binary
# .dockerignore handles excluding node_modules, .git, etc.
COPY . .

# Build the TypeScript project
RUN npm run build

# Remove devDependencies to keep the image slim
RUN npm prune --production

RUN chmod +x ./lumen && mv ./lumen /usr/local/bin/lumen

# Expose the API port
EXPOSE 3001

# Security: Run as non-root
RUN useradd -m lumen && chown -R lumen:lumen /app
USER lumen

# Start the compiled server
CMD ["node", "dist/server.js"]
