import { Router } from 'express';
import {
  getProjectStatuses,
  upsertProjectStatuses,
  getDefaultStatuses,
  deleteProjectStatus,
} from '../controllers/projectStatusController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get default statuses template
router.get('/default', getDefaultStatuses);

// Get statuses for a specific project
router.get('/project/:projectId', getProjectStatuses);

// Create or update statuses for a project (admin/manager only)
router.put('/project/:projectId', authorize('admin', 'manager'), upsertProjectStatuses);

// Delete a specific status (admin/manager only)
router.delete('/project/:projectId/status/:statusId', authorize('admin', 'manager'), deleteProjectStatus);

export default router;
