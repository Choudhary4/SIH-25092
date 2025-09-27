@echo off
echo 🚀 Deploying Mann-Mitra Server to Vercel...

REM Check if we're in the server directory
if not exist package.json (
    echo ❌ Error: Please run this script from the server directory
    pause
    exit /b 1
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

REM Environment variables reminder
echo ⚠️  IMPORTANT: Make sure you have configured these environment variables in Vercel dashboard:
echo    - NODE_ENV=production
echo    - MONGO_URI=your-mongodb-connection-string
echo    - JWT_SECRET=your-jwt-secret
echo    - ENCRYPTION_KEY=your-encryption-key
echo    - CLIENT_URL=your-frontend-url
echo.

set /p "configured=Have you configured all environment variables? (y/n): "
if /i not "%configured%"=="y" (
    echo Please configure environment variables in Vercel dashboard first.
    echo Visit: https://vercel.com/dashboard
    pause
    exit /b 1
)

REM Deploy to production
echo 🚀 Deploying to production...
vercel --prod

echo ✅ Deployment completed!
echo.
echo 📋 Next steps:
echo 1. Test your API endpoints
echo 2. Update your frontend CLIENT_URL if needed
echo 3. Monitor deployment in Vercel dashboard
echo.
echo 🔗 Your API is now available at: https://your-project-name.vercel.app
pause