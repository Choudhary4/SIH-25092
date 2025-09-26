# Student Counselling Platform

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-orange.svg)](https://expressjs.com/)

A comprehensive student counselling platform built for Smart India Hackathon 2025, enabling students to connect with professional counsellors for mental health support and career guidance.

## 🌟 Features

### 👥 **Multi-Role System**
- **Students**: Book appointments, access counselling services, track sessions
- **Counsellors**: Manage availability, conduct sessions, access student information securely
- **Admins**: Oversee platform operations, manage users and appointments
- **Moderators**: Content moderation and support assistance

### 📅 **Appointment Management**
- Real-time counsellor availability checking
- Flexible scheduling with time slot management
- Online (video call) and in-person appointment modes
- Urgency level categorization (Low, Medium, High, Urgent)
- Private encrypted notes for sensitive information

### 🔐 **Security & Privacy**
- JWT-based authentication with role-based access control
- AES encryption for private notes and sensitive data
- Secure password hashing with bcrypt
- Environment-based configuration management

### 📱 **Progressive Web App (PWA)**
- Offline caching for enhanced performance
- Installable web application
- Service worker implementation
- Responsive design for all devices

### 🌐 **Multi-language Support**
- Internationalization (i18n) ready
- Support for multiple languages
- Customizable language preferences per user

## 🏗️ Architecture

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React context providers
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── server/                # Node.js Backend
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── models/        # MongoDB models
    │   ├── routes/        # API routes
    │   ├── middleware/    # Custom middleware
    │   └── utils/         # Utility functions
    └── scripts/           # Database scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.x or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Choudhary4/SIH-25092.git
   cd SIH-25092
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Environment Setup

1. **Backend Configuration**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   ENCRYPTION_KEY=your_256_bit_encryption_key
   ```

2. **Frontend Configuration**
   ```bash
   cd ../client
   # Create .env.local if needed for client-specific variables
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on: `http://localhost:5000`

2. **Start Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   Client runs on: `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/logout` | User logout |
| GET | `/api/v1/auth/me` | Get current user |
| PUT | `/api/v1/auth/me` | Update user profile |

### Appointment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/appointments` | Create appointment |
| GET | `/api/v1/appointments` | Get user appointments |
| GET | `/api/v1/appointments/:id` | Get appointment details |
| PUT | `/api/v1/appointments/:id` | Update appointment |
| DELETE | `/api/v1/appointments/:id` | Cancel appointment |

### Counsellor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/counsellors` | Get all counsellors |
| GET | `/api/v1/counsellors/:id` | Get counsellor details |
| GET | `/api/v1/counsellors/:id/slots` | Get available slots |

## 🛠️ Database Models

### User Model
- Email (unique)
- Password (hashed)
- Name
- College ID (non-unique - multiple students per college)
- Role (student/counsellor/admin/moderator)
- Profile information
- Authentication timestamps

### Appointment Model
- Student and Counsellor references
- Date and time
- Mode (online/in-person)
- Status (pending/confirmed/completed/cancelled)
- Reason and urgency level
- Location (for in-person)
- Private notes (encrypted)

## 🔧 Development Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
```

### Frontend Scripts
```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🌍 Deployment

### Backend Deployment (Heroku/Railway/Vercel)
1. Set environment variables
2. Configure build scripts
3. Deploy with Git integration

### Frontend Deployment (Netlify/Vercel)
1. Build the React application
2. Configure redirects for SPA
3. Deploy with continuous integration

### Database
- Use MongoDB Atlas for production
- Configure proper indexes for performance
- Set up backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines
- Use ESLint and Prettier configurations
- Follow React and Node.js best practices
- Write descriptive commit messages
- Add tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Project Lead**: [Your Name]
- **Frontend Developer**: [Team Member]
- **Backend Developer**: [Team Member]
- **UI/UX Designer**: [Team Member]

## 🙏 Acknowledgments

- Smart India Hackathon 2025
- All contributors and supporters
- Open source community

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for Smart India Hackathon 2025**
