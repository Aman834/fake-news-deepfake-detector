#!/usr/bin/env bash
# Build script for Render.com deployment
# Installs Python deps, builds React frontend, and copies to static dir

set -o errexit

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "📦 Installing Node.js dependencies..."
cd frontend
npm install

echo "🏗️ Building React frontend..."
npm run build

echo "📂 Copying frontend build to static directory..."
cd ..
rm -rf frontend_build
cp -r frontend/dist frontend_build

echo "✅ Build complete!"
