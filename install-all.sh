#!/bin/bash

echo "📦 Installing all dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd family-harmony-app
npm install
cd ..

echo "✅ All dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Open Terminal 1 and run:  bash start-backend.sh"
echo "2. Open Terminal 2 and run:  bash start-frontend.sh"
echo "3. Visit http://localhost:3000"
