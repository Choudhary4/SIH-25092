# Mann-Mitra Server - Vercel Deployment Guide

This server is configured for deployment on Vercel using serverless functions.

## 📦 Pre-deployment Setup

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

## 🚀 Deployment Steps

### 1. Deploy to Vercel
```bash
# From the server directory
cd /path/to/server
vercel --prod
```

### 2. Configure Environment Variables
In your Vercel dashboard, add these environment variables:

#### Required Variables:
```bash
NODE_ENV=production
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key-minimum-32-chars
ENCRYPTION_KEY=your-256-bit-encryption-key
CLIENT_URL=https://your-frontend-domain.vercel.app
```

#### Optional Variables:
```bash
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRE=7
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🔧 Architecture Changes for Vercel

### Serverless Functions
- Main API handler: `/api/index.js`
- Real-time chat: `/api/chat-realtime.js` (polling-based)

### Database Connection
- Uses connection pooling for serverless efficiency
- Cached connections to reduce cold start times

### Rate Limiting
- Modified for serverless environment
- Uses in-memory storage (consider Redis for production)

## 📡 API Endpoints

After deployment, your API will be available at:
```
https://your-project-name.vercel.app/api/v1/
```

### Available Endpoints:
- `GET /health` - Health check
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/appointments` - Get appointments
- `POST /api/v1/chat/messages/:roomId` - Send message
- `GET /api/v1/chat/messages/:roomId` - Get messages
- And more...

## 🔄 Real-time Communication

Since Vercel doesn't support WebSockets, the chat system uses:
- **HTTP Polling**: Regular requests to check for new messages
- **REST API**: Send/receive messages via HTTP endpoints
- **Client-side polling**: Frontend polls for new messages every few seconds

### Chat API Endpoints:
```bash
# Get messages
GET /api/chat-realtime/messages/:roomId

# Send message
POST /api/chat-realtime/messages/:roomId

# Join room
POST /api/chat-realtime/rooms/:roomId/join

# Leave room
POST /api/chat-realtime/rooms/:roomId/leave
```

## 🛠 Development vs Production

### Local Development:
```bash
npm run dev
# Uses Socket.io with WebSockets
```

### Vercel Production:
```bash
vercel --prod
# Uses HTTP polling for real-time features
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Properly configured for your frontend domain
3. **Rate Limiting**: Applied to prevent abuse
4. **Helmet**: Security headers enabled
5. **Input Validation**: All inputs validated and sanitized

## 📊 Monitoring

### Built-in Endpoints:
- `GET /health` - Server health check
- `GET /api/chat-realtime/health` - Chat service health

### Vercel Analytics:
Enable in Vercel dashboard for performance monitoring

## 🚨 Limitations

1. **No WebSockets**: Uses polling instead
2. **Cold Starts**: First request may be slower
3. **Execution Time**: 30-second timeout per function
4. **Memory**: Limited to function memory allocation

## 🔄 Updates and Redeployment

```bash
# Make changes to your code
git add .
git commit -m "Update server"
git push

# Redeploy
vercel --prod
```

## 📝 Environment Variables Reference

Copy these to your Vercel dashboard:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters-long
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRE=7
ENCRYPTION_KEY=your-256-bit-encryption-key-as-64-character-hex-string-here
CLIENT_URL=https://your-frontend-domain.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check MongoDB URI
   - Ensure IP whitelist includes 0.0.0.0/0

2. **Environment Variables Missing**
   - Verify all required vars in Vercel dashboard
   - Redeploy after adding variables

3. **CORS Errors**
   - Update CLIENT_URL in environment variables
   - Check allowed origins in api/index.js

4. **Function Timeout**
   - Optimize database queries
   - Use connection pooling
   - Consider breaking large operations into smaller functions

For more help, check Vercel documentation or contact support.