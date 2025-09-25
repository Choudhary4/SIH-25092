# Authentication System Documentation

## Overview

This MindCare frontend application includes a comprehensive authentication system with token management, API client integration, and secure storage utilities.

## Components

### 1. AuthContext (`src/contexts/AuthContext.jsx`)

The main authentication context provider that manages user state and authentication operations.

#### Features:
- User authentication state management
- JWT token handling with automatic persistence
- Login/logout functionality
- User registration
- Profile updates
- Token refresh mechanism
- Protected route HOC
- Automatic token validation on app initialization

#### Usage:
```jsx
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth()
  
  // Your component logic
}
```

### 2. API Client (`src/utils/api.js`)

Axios-based API client with automatic token injection and error handling.

#### Features:
- Automatic Authorization header injection
- Token refresh on 401 errors
- Request/response interceptors
- Error handling and categorization
- Specialized API endpoints for different modules
- File upload support
- Request timeout configuration

#### Usage:
```jsx
import { authAPI, screeningAPI, chatAPI } from '../utils/api'

// Using specialized APIs
const loginUser = async (credentials) => {
  const response = await authAPI.login(credentials)
  return response.data
}

// Using generic API wrapper
import { apiWrapper } from '../utils/api'
const response = await apiWrapper.get('/custom-endpoint')
```

### 3. Secure Storage (`src/utils/auth.js`)

Secure token and user data storage utilities with multiple storage strategies.

#### Features:
- Secure cookie storage (when available)
- localStorage fallback
- Memory storage as last resort
- JWT token utilities (decode, expiration check)
- Data validation and consistency checks
- Automatic cleanup on logout

#### Usage:
```jsx
import { tokenStorage, userStorage, jwtUtils } from '../utils/auth'

// Store token securely
tokenStorage.setToken(token, { useSecureCookies: true })

// Check token expiration
const isExpired = jwtUtils.isExpired(token)
```

### 4. API Hooks (`src/hooks/useApi.js`)

Custom React hooks for handling API operations with consistent error handling.

#### Features:
- `useApi` - General API operations
- `useApiForm` - Form submission handling
- `usePaginatedApi` - Paginated data fetching
- Automatic loading states
- Error handling
- Success callbacks

#### Usage:
```jsx
import { useApi, useApiForm } from '../hooks/useApi'

function MyComponent() {
  const { data, loading, error, execute } = useApi(authAPI.getProfile)
  const { handleSubmit, isSubmitting } = useApiForm(authAPI.updateProfile)
  
  // Your component logic
}
```

## Authentication Flow

### 1. Login Process
```
User enters credentials → AuthContext.login() → API call → Store token & user → Update state
```

### 2. Token Refresh
```
API call fails with 401 → Interceptor catches → Call refresh endpoint → Update token → Retry original request
```

### 3. Logout Process
```
User clicks logout → AuthContext.logout() → API call → Clear storage → Update state → Redirect
```

## Configuration

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MindCare
VITE_NODE_ENV=development
```

### API Endpoints Expected

The authentication system expects these backend endpoints:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration  
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /auth/verify` - Token verification
- `PUT /auth/profile` - Profile update

## Security Features

### 1. Token Storage
- Secure httpOnly cookies (when in HTTPS)
- localStorage fallback for development
- Memory storage as last resort
- Automatic cleanup on errors

### 2. Request Security
- Authorization header injection
- Request timeout (10 seconds)
- CSRF protection ready
- Secure cookie configuration

### 3. Error Handling
- Network error detection
- Token expiration handling
- Automatic logout on security errors
- User-friendly error messages

## Protected Routes

Use the `withAuth` HOC to protect routes:

```jsx
import { withAuth } from '../contexts/AuthContext'

const ProtectedComponent = withAuth(() => {
  return <div>This is protected content</div>
})
```

Or check authentication status manually:

```jsx
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>
  
  return <div>Protected content</div>
}
```

## API Error Types

The system categorizes errors into:

- `NETWORK_ERROR` - Network connectivity issues
- `TOKEN_EXPIRED` - Authentication token expired
- `CLIENT_ERROR` - 4xx HTTP status codes
- `SERVER_ERROR` - 5xx HTTP status codes
- `UNKNOWN_ERROR` - Unexpected errors

## Best Practices

### 1. Token Management
- Tokens are automatically attached to requests
- Refresh tokens are handled transparently
- Storage is cleared on logout or errors

### 2. Error Handling
- Use the provided hooks for consistent error handling
- Display user-friendly error messages
- Log errors for debugging (development only)

### 3. Loading States
- Show loading indicators during API calls
- Disable forms during submission
- Provide feedback for long operations

## Integration with Pages

### Login Page (`src/pages/Login.jsx`)
- Complete login form with validation
- Error display and handling
- Redirect after successful login
- Responsive design

### Register Page (`src/pages/Register.jsx`)
- Comprehensive registration form
- Client-side validation
- Terms and conditions
- Responsive design

### Header Component (`src/components/Header.jsx`)
- User menu with authentication status
- Login/logout buttons
- Profile dropdown
- Mobile-friendly design

## Debugging

### Development Mode
- API call timing logs
- Error logging to console
- Token validation checks
- Storage consistency validation

### Production Mode
- Error tracking integration ready
- Secure storage preferences
- Minimal logging
- Performance optimized

## Future Enhancements

### Planned Features
- Social login integration
- Two-factor authentication
- Password strength requirements
- Session management
- Remember me functionality
- Account verification

### Security Improvements
- Content Security Policy headers
- Request signing
- Rate limiting
- Audit logging
- Session timeout

## Troubleshooting

### Common Issues

1. **Token not persisting**
   - Check browser storage permissions
   - Verify HTTPS for secure cookies
   - Check for storage quota limits

2. **API calls failing**
   - Verify backend URL in .env
   - Check CORS configuration
   - Validate token format

3. **Refresh not working**
   - Ensure refresh endpoint exists
   - Check token expiration times
   - Validate refresh token storage

### Debug Tools

The system includes debug utilities:

```jsx
import { validateStoredAuth } from '../utils/auth'

// Check authentication state
const authState = validateStoredAuth()
console.log('Auth validation:', authState)
```

## Support

For issues and questions:
1. Check the console for error messages
2. Verify environment configuration
3. Test API endpoints independently
4. Review token expiration times
5. Check network connectivity