#!/bin/bash

# Manual Deployment Script for Render (Lumen Platform)
# Use this when GitHub repository linking is not possible.

# 1. Login to Render Container Registry (if applicable) or use Docker Hub
# Render supports pulling images from any public/private registry.

REGISTRY_URL="docker.io" # Default to Docker Hub
USERNAME="your-docker-username"

echo "── Deploying Lumen Platform via Docker ──"

# Build and Push IDE Backend
echo "Building IDE Backend..."
docker build -t $USERNAME/lumen-ide-backend:latest ./web-ide-backend
docker push $USERNAME/lumen-ide-backend:latest

# Build and Push Registry Backend
echo "Building Registry Backend..."
docker build -t $USERNAME/lumen-registry:latest ./registry-backend
docker push $USERNAME/lumen-registry:latest

# Build and Push Website
# Note: Next.js needs a specialized Dockerfile for production standalone builds
echo "Building Website..."
docker build -t $USERNAME/lumen-website:latest -f ./website/Dockerfile ./website
docker push $USERNAME/lumen-website:latest

echo "── Push Complete! ──"
echo "Instructions:"
echo "1. Go to Render Dashboard -> New + -> Web Service"
echo "2. Select 'Existing Image' and enter $USERNAME/lumen-ide-backend:latest"
echo "3. Repeat for Registry and Website."
echo "4. Remember to set environment variables (DATABASE_URL, NEXT_PUBLIC_BACKEND_URL)."
