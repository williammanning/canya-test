#!/bin/bash

# Canya Application Setup Script

echo "Canya - Community Services Platform"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    mkdir -p data
    echo "✅ Created data directory"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server, run:"
echo "  npm start"
echo ""
echo "Then open your browser to:"
echo "  http://localhost:3000"
echo ""
echo "Admin credentials:"
echo "  Email: admin@canya.com"
echo "  Password: admin123"
echo ""
echo "For more information, see GETTING_STARTED.md"
