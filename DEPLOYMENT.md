# Cafe Manager - Deployment Guide

## Pre-Deployment Checklist

### Backend Server
- [x] MongoDB connection with proper error handling
- [x] Input validation with Joi schemas
- [x] Authentication & Authorization middleware
- [x] MongoDB ObjectId validation for all endpoints
- [x] Global error handler & 404 handler
- [x] Unhandled promise rejection handler
- [x] Environment variables properly configured
- [x] CORS configured for localhost

### Frontend Client
- [x] Product name display fixed (supports long Georgian text)
- [x] Statistics page fully translated to Georgian
- [x] Settings page emojis removed for cleaner UI
- [x] Responsive design for all screen sizes
- [x] Error handling for API failures
- [x] Loading states for async operations

### Security
- [x] .env files in .gitignore (secrets protected)
- [x] JWT token validation on protected routes
- [x] Role-based access control (RBAC)
- [x] HttpOnly cookies for JWT tokens
- [x] Input sanitization via Joi validation
- [x] CORS restrictions enabled

---

## Setup Instructions

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd pool-project

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

**Server** (`server/.env`):
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/Caffe-App
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
JWT_SECRET=secret_key_here
```

**Client** (`client/.env`):
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
# Terminal 1 - Start backend (from server/)
npm run dev

# Terminal 2 - Start frontend (from client/)
npm run dev
```

Access the app at: `http://localhost:5173`

---

## Deployment to Another Laptop

### Via Git:
```bash
# On new laptop
git clone <your-repo-url>
cd pool-project

# Setup both folders
cd server && npm install
cd ../client && npm install

# Update .env files with new MongoDB credentials if needed
# Then run as normal
```

### Via File Transfer:
```bash
# Copy the entire project folder (excluding node_modules)
# Create fresh .env files on the new machine
# Run npm install in both folders
```

---

## Production Deployment (Optional)

### Update .env for Production:
```
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
JWT_SECRET=generate_a_strong_random_secret_here
```

### Deploy Backend (Example: Heroku/Render):
```bash
# Build for production
npm run dev  # or implement a build script

# Deploy using your hosting provider
```

### Deploy Frontend (Example: Vercel/Netlify):
```bash
npm run build
# Deploy the dist/ folder
```

---

## Troubleshooting

### MongoDB Connection Failed
- Verify MONGO_URI is correct
- Check MongoDB Atlas credentials
- Ensure IP whitelist allows your location

### CORS Errors
- Verify FRONTEND_URL matches client origin
- Check BACKEND_URL is accessible

### Token Expiration
- Users will be logged out after 14 days
- Clear cookies and login again if needed

### Product Name Display Issues
- Product names now support multi-line display
- Long Georgian text will wrap properly

---

## Key Features

 **Order Management**: Create, view, and delete orders  
 **Product Management**: Add, edit, update prices, delete products  
 **Analytics Dashboard**: Real-time order statistics in Georgian  
 **Settings Page**: Manage product inventory and prices  
 **User Authentication**: Role-based access (Receptionist/Staff)  
 **Data Aggregation**: Efficient MongoDB aggregations for performance  

---

