# Project Tracker - Setup Guide

This guide will walk you through setting up the Project Tracker application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

## Database Setup

### 1. Install and Start PostgreSQL

Make sure PostgreSQL is installed and running on your system.

### 2. Connect to the Database

The application is configured to connect to:
- **Host:** 172.16.10.130
- **Port:** 5432
- **Database:** project_tracker
- **User:** pega
- **Password:** 0okmNJI(8uhb

**Note:** These are the production database credentials. If you want to use a local database:

1. Create a new PostgreSQL database:
```bash
createdb project_tracker
```

2. Update the database credentials in `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=project_tracker
```

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

The `.env` file is already created with the following configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=172.16.10.130
DB_PORT=5432
DB_USER=pega
DB_PASSWORD=0okmNJI(8uhb
DB_NAME=project_tracker

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

**Important:** Change the `JWT_SECRET` to a random secure string in production!

### 4. Run Database Migrations

This will create all necessary tables in the database:

```bash
npm run migrate:latest
```

### 5. Seed the Database (Development Only)

This will populate the database with sample data:

```bash
npm run seed:run
```

Or use the combined command:

```bash
npm run db:setup
```

### 6. Start the Backend Server

```bash
npm run dev
```

The backend server will start on `http://localhost:3001`

You should see:
```
🚀 Server is running on port 3001
📝 Environment: development
💾 Database: project_tracker@172.16.10.130:5432
```

## Frontend Setup

### 1. Open New Terminal and Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration (Optional)

Create a `.env` file in the frontend directory if you need custom API URL:

```env
VITE_API_URL=http://localhost:3001/api
```

The frontend is already configured to proxy API requests to `localhost:3001`.

### 4. Start the Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

You should see:
```
  VITE v5.0.11  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### Login with Demo Accounts

**Admin Account:**
- Email: `admin@projecttracker.com`
- Password: `password123`

**Manager Account:**
- Email: `manager@projecttracker.com`
- Password: `password123`

**Team Lead Account:**
- Email: `lead@projecttracker.com`
- Password: `password123`

**Team Member Account:**
- Email: `john.doe@projecttracker.com`
- Password: `password123`

## Available Scripts

### Backend

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
npm run migrate:latest    # Run latest migrations
npm run migrate:rollback  # Rollback last migration
npm run seed:run    # Run seed files
npm run db:setup    # Run migrations and seeds
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Project Structure Quick Reference

```
backend/
├── src/
│   ├── config/database.ts          # DB connection
│   ├── controllers/                # Business logic
│   ├── database/
│   │   ├── migrations/             # DB schema changes
│   │   └── seeds/                  # Sample data
│   ├── middleware/auth.ts          # Authentication
│   ├── routes/                     # API endpoints
│   └── server.ts                   # Express app

frontend/
├── src/
│   ├── components/Layout.tsx       # Main layout
│   ├── pages/                      # Page components
│   ├── stores/authStore.ts         # Authentication state
│   ├── types/index.ts              # TypeScript types
│   └── utils/api.ts                # API client
```

## Troubleshooting

### Backend Issues

**Error: "Cannot connect to database"**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure the database exists

**Error: "Port 3001 is already in use"**
- Change the PORT in `backend/.env`
- Or kill the process using port 3001

**Error: "Migration failed"**
- Ensure database connection is working
- Try rolling back: `npm run migrate:rollback`
- Then run migrations again: `npm run migrate:latest`

### Frontend Issues

**Error: "Cannot connect to API"**
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify API URL in vite.config.ts proxy settings

**Error: "Port 3000 is already in use"**
- Vite will automatically try the next available port
- Or manually change port in `vite.config.ts`

### Database Seeding Issues

**Seeds not running in production:**
- This is intentional! Seeds only run in development
- The seed files check `NODE_ENV === 'production'` and skip execution

## Building for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
```

The built files will be in the `dist` directory. Serve them with a static file server or integrate with your backend.

## Next Steps

After successfully setting up the application:

1. Explore the dashboard
2. Create a new project
3. Add team members to projects
4. Create and assign tasks
5. Request leave dates
6. Review the requirements.md for upcoming features

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the requirements.md document
- Check the API endpoints in README.md

---

**Happy Coding! 🚀**

