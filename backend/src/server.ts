import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import leaveRoutes from './routes/leaveRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import settingsRoutes from './routes/settingsRoutes';
import projectStatusRoutes from './routes/projectStatusRoutes';
import projectAttachmentRoutes from './routes/projectAttachmentRoutes';
import aiRoutes from './routes/aiRoutes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
// CORS configuration - allow frontend origin in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*' 
    : '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/project-statuses', projectStatusRoutes);
app.use('/api', projectAttachmentRoutes);
app.use('/api/ai', aiRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check (must be before catch-all routes)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req: Request, res: Response) => {
    // Don't serve frontend for API routes or health check
    if (req.path.startsWith('/api') || req.path === '/health') {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 404 handler (only for API routes in production, or all routes in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

export default app;

