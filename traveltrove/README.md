# TravelTrove - Travel Community Platform

A professional-grade MERN stack web application for travel communities, featuring community management, invitation system, and user interactions.

## Features

- **User Authentication**: Register, login, and profile management
- **Community Management**: Create, join, and manage travel communities
- **Invitation System**: Send and manage community invitations via email
- **Search & Filter**: Find communities by category, location, and keywords
- **Responsive Design**: Modern UI built with Material-UI
- **Real-time Updates**: Dynamic community data and member management

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email invitations
- **Express Validator** for input validation

### Frontend
- **React** with functional components and hooks
- **Material-UI** for modern UI components
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd traveltrove
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Setup**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/traveltrove
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in MONGODB_URI
   ```

6. **Seed the database**
   ```bash
   npm run seed
   ```

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   npm run dev
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   npm run client
   ```

3. **Or run both simultaneously**
   ```bash
   npm run dev:full
   ```

### Production Mode

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Communities
- `GET /api/communities` - Get all communities (with filters)
- `GET /api/communities/:id` - Get specific community
- `POST /api/communities` - Create new community
- `PUT /api/communities/:id` - Update community
- `DELETE /api/communities/:id` - Delete community
- `POST /api/communities/:id/join` - Join community
- `POST /api/communities/:id/leave` - Leave community

### Invitations
- `POST /api/invitations` - Send invitation
- `GET /api/invitations/:token` - Get invitation details
- `POST /api/invitations/:token/accept` - Accept invitation
- `POST /api/invitations/:token/decline` - Decline invitation
- `GET /api/invitations/community/:communityId` - Get community invitations

## Sample Data

The application comes with pre-seeded data including:

- **8 Sample Users** with different profiles and interests
- **8 Sample Communities** covering various travel categories
- **3 Sample Invitations** for testing the invitation system

### Test Accounts
- Email: `alice@example.com` | Password: `password123`
- Email: `bob@example.com` | Password: `password123`
- Email: `charlie@example.com` | Password: `password123`

## Features Overview

### Community Management
- Create communities with categories, descriptions, and rules
- Join/leave communities
- View member lists and community details
- Admin and moderator roles

### Invitation System
- Send email invitations to join communities
- Personal messages with invitations
- Accept/decline invitations
- Invitation expiration (7 days)
- Email notifications with beautiful HTML templates

### Search & Discovery
- Search communities by name and description
- Filter by category, location, and other criteria
- Sort by creation date, name, or member count
- Pagination for large result sets

### User Experience
- Responsive design for all devices
- Modern Material-UI components
- Loading states and error handling
- Intuitive navigation and user flows

## Project Structure

```
traveltrove/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── utils/          # Utility functions
│   └── package.json
├── models/                 # MongoDB models
├── routes/                 # Express routes
├── middleware/             # Custom middleware
├── scripts/                # Database seeding scripts
├── server.js              # Main server file
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@traveltrove.com or create an issue in the repository.

---

**TravelTrove** - Connect with fellow travelers and discover amazing destinations together! 🌍✈️
