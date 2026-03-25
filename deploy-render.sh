#!/bin/bash
set -e

# Hardened Manual Deployment Script for Unified Lumen Backend
# This script bypasses GitHub-to-Render issues by building locally and pushing to Docker Hub.

echo "── Starting Hardened Unified Lumen Backend Deployment ──"
echo "Note: Using local Docker build to bypass the 'flagged account' cloning issue. 🚀"

# Make sure this matches your Docker Hub username
USERNAME="mal4crypt"
IMAGE_NAME="lumen-unified-backend"

# 1. Unified Backend
echo "📦 Building & Pushing Unified Backend..."
cd backend
docker build -t $USERNAME/$IMAGE_NAME:latest .
docker push $USERNAME/$IMAGE_NAME:latest
cd ..

echo "✅ Unified Backend Image Pushed! 🎆"
echo "── Final Steps on Render ──"
echo "1. Go to your Render Dashboard."
echo "2. Click 'New' -> 'Web Service'."
echo "3. Choose 'Deploy an existing image'."
echo "4. Use: docker.io/$USERNAME/$IMAGE_NAME:latest"
echo "5. Configure your environment variables (DATABASE_URL, etc.) in the Render dashboard."
