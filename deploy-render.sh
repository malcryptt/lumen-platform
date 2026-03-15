#!/bin/bash
set -e

# Optimized Manual Deployment Script for Render
echo "── Starting Optimized Lumen Backend Deployment ──"
echo "Note: Using node:20-slim to save your data usage! 📉"

USERNAME="mal4crypt"

# 1. IDE Backend
echo "📦 Building & Pushing IDE Backend..."
cd web-ide-backend
docker build -t $USERNAME/lumen-ide-backend:latest .
docker push $USERNAME/lumen-ide-backend:latest
cd ..

# 2. Registry Backend
echo "📦 Building & Pushing Registry Backend..."
cd registry-backend
docker build -t $USERNAME/lumen-registry:latest .
docker push $USERNAME/lumen-registry:latest
cd ..

echo "✅ All Backend Images Pushed! 🎆"
echo "Next Step: You are 100% done with the terminal. Just go to Render and click 'Deploy latest reference' for both services."
"
