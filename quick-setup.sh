#!/bin/bash

# Quick Setup Script for Go Goal
# This script sets up everything needed to run Go Goal quickly

set -e

echo "🚀 Go Goal Quick Setup"
echo "====================="
echo ""

# Check if PostgreSQL is running
if ! pg_isready >/dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running. Starting PostgreSQL..."
    
    # Try to start PostgreSQL based on the system
    if command -v brew >/dev/null 2>&1; then
        # macOS with Homebrew
        brew services start postgresql || true
    elif command -v systemctl >/dev/null 2>&1; then
        # Linux with systemd
        sudo systemctl start postgresql || true
    else
        echo "❌ Could not start PostgreSQL automatically. Please start it manually."
        echo "   Then run this script again."
        exit 1
    fi
    
    # Wait a moment for PostgreSQL to start
    sleep 3
fi

# Run database setup
echo "📊 Setting up database..."
./setup-db.sh

echo ""
echo "📦 Installing Go dependencies..."
go mod tidy

echo ""
echo "🎉 Setup complete! You can now run:"
echo ""
echo "   ./dev.sh start     # Start both backend and frontend"
echo "   make dev           # Alternative using Makefile"
echo ""
echo "The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo ""