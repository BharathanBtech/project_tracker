import { Router } from 'express';
import { authenticate } from '../middleware/auth';

// Import from organized AI structure
import aiRoutes from '../ai/routes/aiRoutes';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

// Use the organized AI routes
router.use('/', aiRoutes);

export default router;

