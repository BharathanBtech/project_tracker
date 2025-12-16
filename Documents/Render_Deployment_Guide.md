# Render Deployment Guide

This guide will walk you through deploying the Project Tracker application to Render.

## Prerequisites

- A Render account ([Sign up here](https://render.com))
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Overview

The application is configured to deploy as a single web service that:
- Serves the backend API
- Serves the frontend static files
- Connects to a PostgreSQL database

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your code is pushed to a Git repository that Render can access.

### 2. Create a PostgreSQL Database on Render

1. Go to your Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `project-tracker-db`
   - **Database**: `project_tracker`
   - **User**: `project_tracker_user`
   - **Plan**: Starter (or your preferred plan)
4. Click "Create Database"
5. Note the connection details (they'll be auto-configured via `render.yaml`)

### 3. Deploy Using render.yaml (Recommended)

1. In your Render Dashboard, click "New +" → "Blueprint"
2. Connect your Git repository
3. Render will automatically detect the `render.yaml` file
4. Review the configuration and click "Apply"

The `render.yaml` file will:
- Create the web service
- Create the PostgreSQL database
- Link them together
- Set up environment variables automatically
- Run database migrations after deployment

### 4. Manual Deployment (Alternative)

If you prefer to deploy manually:

#### Create Web Service

1. Go to Render Dashboard → "New +" → "Web Service"
2. Connect your Git repository
3. Configure:
   - **Name**: `project-tracker-backend`
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install && npm run build && cd ../frontend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Post Deploy Command**: `cd backend && npm run migrate:latest`

#### Set Environment Variables

Add the following environment variables in the Render dashboard:

**Required:**
- `NODE_ENV` = `production`
- `PORT` = `3001` (Render will override this, but set it anyway)
- `JWT_SECRET` = Generate a secure random string (or use Render's generateValue)
- `JWT_EXPIRES_IN` = `7d`
- `MAX_FILE_SIZE` = `5242880`
- `UPLOAD_DIR` = `uploads`

**Database (from PostgreSQL service):**
- `DB_HOST` = (from database service)
- `DB_PORT` = (from database service)
- `DB_USER` = (from database service)
- `DB_PASSWORD` = (from database service)
- `DB_NAME` = (from database service)

**Optional:**
- `FRONTEND_URL` = Your Render service URL (for CORS)

### 5. Verify Deployment

1. Check the deployment logs for any errors
2. Visit your service URL (e.g., `https://project-tracker-backend.onrender.com`)
3. Test the health endpoint: `https://your-service.onrender.com/health`
4. Verify the frontend loads correctly
5. Test login functionality

## Post-Deployment Checklist

- [ ] Database migrations ran successfully (check logs)
- [ ] Health check endpoint responds (`/health`)
- [ ] Frontend loads correctly
- [ ] API endpoints are accessible
- [ ] Authentication works
- [ ] File uploads work (if applicable)
- [ ] CORS is configured correctly

## Important Notes

### Database Migrations

- Migrations run automatically via `postDeployCommand` after each deployment
- If migrations fail, check the deployment logs
- You can manually run migrations using Render's shell: `cd backend && npm run migrate:latest`

### Environment Variables

- Never commit `.env` files with real credentials
- Use Render's environment variable management
- `JWT_SECRET` should be a strong, random string
- Database credentials are automatically linked if using Render's PostgreSQL

### File Uploads

- Uploaded files are stored in the `uploads` directory
- **Important**: Render's filesystem is ephemeral - files will be lost on redeploy
- Consider using cloud storage (S3, Cloudinary, etc.) for production

### Static File Serving

- The backend serves frontend static files in production
- Frontend is built during the build process
- Ensure `frontend/dist` exists after build

## Troubleshooting

### Build Fails

- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Database Connection Issues

- Verify database service is running
- Check environment variables are set correctly
- Ensure database credentials match

### Frontend Not Loading

- Verify frontend build completed successfully
- Check that `frontend/dist` directory exists
- Verify static file serving in `server.ts`

### Migrations Fail

- Check database connection
- Verify migration files are correct
- Check migration logs in deployment output

### CORS Errors

- Verify `FRONTEND_URL` environment variable is set
- Check CORS configuration in `server.ts`
- Ensure frontend API URL matches backend URL

## Updating the Application

1. Push changes to your Git repository
2. Render will automatically detect changes and redeploy
3. Migrations will run automatically via `postDeployCommand`
4. Monitor deployment logs for any issues

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret
2. **Database Password**: Never commit passwords to Git
3. **CORS**: Configure allowed origins properly
4. **Helmet**: Already configured for security headers
5. **File Uploads**: Validate file types and sizes

## Cost Optimization

- Use Render's free tier for development/testing
- Starter plan is sufficient for small to medium applications
- Consider upgrading if you need more resources

## Support

For Render-specific issues:
- [Render Documentation](https://render.com/docs)
- [Render Support](https://render.com/support)

For application-specific issues:
- Check the main setup guide: `Documents/How_to_setup.md`
- Review application logs in Render dashboard

---

**Happy Deploying! 🚀**

