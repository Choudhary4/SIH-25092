# Forum Frontend-Backend Connection Guide

## Overview
This guide explains how to properly connect the Mann-Mitra forum frontend and backend components.

## Backend Setup (Server)

### 1. Environment Configuration
Create `/server/.env` file:
```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/mann-mitra-db
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters-long-for-mann-mitra-app
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRE=7
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890123456
```

### 2. Start Backend Server
```bash
cd server
npm install
npm start
# or use: node src/index.js
```

### 3. Verify Backend is Running
- Health check: http://localhost:5000/health
- Should return: `{"status":"OK","timestamp":"...","uptime":...}`

## Frontend Setup (Client)

### 1. Environment Configuration
Create `/client/client/.env` file:
```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Mann-Mitra
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
VITE_ENABLE_FORUM=true
```

### 2. Start Frontend Server
```bash
cd client/client
npm install
npm run dev
```

### 3. Frontend will run on: http://localhost:5173

## API Endpoints Used by Forum

### Backend Routes (Server)
- `GET /api/v1/forum/threads` - Get forum posts/threads with pagination
- `POST /api/v1/forum/posts` - Create new forum post (supports anonymous)
- `GET /api/v1/forum/posts/:id` - Get specific post with replies
- `POST /api/v1/forum/posts/:id/like` - Like/unlike post
- `POST /api/v1/forum/posts/:id/report` - Report post
- `PATCH /api/v1/forum/posts/:id/moderate` - Moderate post (admin only)

### Frontend API Calls (Forum.jsx)
- `api.get('/v1/forum/threads?page=1&limit=10')` - Fetch threads
- `api.post('/v1/forum/posts', postData)` - Create new post/reply
- `api.get('/v1/forum/posts/${id}')` - Get thread details

## CORS Configuration

Backend (`server/src/index.js`) includes:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));
```

## Database Requirements

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create database: `mann-mitra-db`
3. Collections will be created automatically by Mongoose

### Required Models
- `ForumPost` - Forum posts/threads (defined in `/server/src/models/forum.model.js`)
- `User` - User authentication (if using auth features)

## Testing the Connection

### 1. Manual Testing
Run the test script:
```bash
cd server
node test-forum-api.js
```

### 2. Browser Testing
1. Start both servers
2. Navigate to http://localhost:5173/forum
3. Click "New Post" - modal should appear
4. Submit a test post
5. Check browser console for API calls

## Troubleshooting

### Common Issues

#### 1. CORS Errors
- Ensure CORS is configured in backend
- Check frontend API URL in .env file
- Verify both servers are running on correct ports

#### 2. API Endpoint Not Found (404)
- Check backend routes are properly mounted
- Verify API endpoint URLs match between frontend/backend
- Ensure `/api/v1/forum` routes are registered

#### 3. Database Connection Issues
- Check MongoDB is running
- Verify MONGO_URI in backend .env
- Check database name matches

#### 4. Modal Issues
- Removed framer-motion AnimatePresence conflicts
- Using simple conditional rendering
- Check browser console for React errors

### Debug Steps
1. Check backend health: `curl http://localhost:5000/health`
2. Check forum threads: `curl http://localhost:5000/api/v1/forum/threads`
3. Monitor browser Network tab for API calls
4. Check both server and browser console logs

## Key Files Modified

### Backend
- `/server/src/index.js` - CORS configuration
- `/server/src/routes/forum.routes.js` - Forum routes
- `/server/src/controllers/forum.controller.js` - Forum logic
- `/server/.env` - Environment variables

### Frontend
- `/client/client/src/pages/Forum.jsx` - Main forum component
- `/client/client/src/utils/api.js` - API client configuration
- `/client/client/.env` - Frontend environment variables

## Success Indicators

✅ Backend server starts without errors
✅ Frontend connects to backend API
✅ Forum threads load properly
✅ New post modal opens and works
✅ Posts can be created successfully
✅ Thread details can be viewed
✅ No CORS errors in browser console