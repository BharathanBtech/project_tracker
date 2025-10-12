import { Router } from 'express';
import { authenticate } from '../../middleware/auth';

// Import controllers
import { getTaskSuggestions } from '../features/task-suggestions/taskSuggestionController';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

// Task Suggestions
router.post('/task-suggestions', getTaskSuggestions);

// Future AI feature routes
// router.post('/project-analysis', getProjectAnalysis);
// router.post('/resource-planning', getResourcePlanning);
// router.post('/risk-assessment', getRiskAssessment);
// router.post('/performance-insights', getPerformanceInsights);

export default router;
