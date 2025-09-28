#!/bin/bash

echo "🚀 Deploying Mann-Mitra Server to Vercel..."

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the server directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login check
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Environment variables reminder
echo "⚠️  IMPORTANT: Make sure you have configured these environment variables in Vercel dashboard:"
echo "   - NODE_ENV=production"
echo "   - MONGO_URI=your-mongodb-connection-string"
echo "   - JWT_SECRET=your-jwt-secret"
echo "   - ENCRYPTION_KEY=your-encryption-key"
echo "   - CLIENT_URL=your-frontend-url"
echo ""

read -p "Have you configured all environment variables? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please configure environment variables in Vercel dashboard first."
    echo "Visit: https://vercel.com/dashboard"
    exit 1
fi

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test your API endpoints"
echo "2. Update your frontend CLIENT_URL if needed"
echo "3. Monitor deployment in Vercel dashboard"
echo ""
echo "🔗 Your API is now available at: https://your-project-name.vercel.app"