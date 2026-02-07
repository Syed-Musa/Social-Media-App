# SocialPost Application

A modern social media platform built with React (Vite) frontend and Node.js/Express backend with MongoDB.

## Features

- User authentication (login/signup)
- Post creation with text and images
- Like and comment functionality
- Real-time feed updates
- Responsive design

## Tech Stack

### Frontend
- React with Vite
- Modern CSS with custom properties
- Responsive design

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- RESTful API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

## Local Development Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Media-App-Assignment
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialpost
JWT_SECRET=your-secret-key-here
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```

## Deployment

### Render Deployment

1. **Create Accounts**:
   - Sign up at [Render](https://render.com)
   - Create a MongoDB database (you can use MongoDB Atlas)

2. **Deploy Backend**:
   - Fork this repository to GitHub
   - Connect your GitHub repo to Render
   - Create a new Web Service
   - Configure environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure secret key
     - `NODE_ENV`: production
     - `PORT`: 5000

3. **Deploy Frontend**:
   - Create a new Static Site on Render
   - Point to the `frontend` directory
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable:
     - `VITE_API_URL`: Your backend service URL from Render

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-service.onrender.com
```

## Project Structure

```
Media-App-Assignment/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── posts.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── render.yaml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `POST /api/posts/:id/like` - Like/unlike a post
- `POST /api/posts/:id/comments` - Add a comment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
