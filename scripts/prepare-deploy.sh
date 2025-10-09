#!/bin/bash
# Prepare deployment package for Azure App Service
# This script creates a clean deployment directory with only necessary files

echo "Preparing deployment package..."

# Create deployment directory
DEPLOY_DIR="deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy necessary files and directories
echo "Copying build output..."
cp -r .next $DEPLOY_DIR/

echo "Copying public assets..."
cp -r public $DEPLOY_DIR/

echo "Copying Prisma schema..."
cp -r prisma $DEPLOY_DIR/

echo "Copying configuration files..."
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp next.config.mjs $DEPLOY_DIR/
cp server.js $DEPLOY_DIR/ 2>/dev/null || echo "No server.js found (optional)"

# Copy node_modules (or we'll reinstall on server)
if [ "$SKIP_NODE_MODULES" != "true" ]; then
  echo "Copying node_modules..."
  cp -r node_modules $DEPLOY_DIR/
fi

echo "✅ Deployment package ready in $DEPLOY_DIR/"
echo "Package includes:"
ls -lah $DEPLOY_DIR/
