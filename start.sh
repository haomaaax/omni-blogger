#!/bin/bash

# Blog Editor - Quick Start Script
# Run this to start the editor

echo ""
echo "📝 Starting Blog Editor..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "   Install with: brew install node"
    exit 1
fi

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found."
    echo "   Make sure you're in the blog-editor folder."
    exit 1
fi

# Start the server
node server.js
