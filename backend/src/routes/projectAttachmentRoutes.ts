import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  uploadMiddleware,
  uploadProjectAttachment,
  getProjectAttachments,
  downloadProjectAttachment,
  deleteProjectAttachment,
} from '../controllers/projectAttachmentController';

const router = Router();

// Upload project attachment (admin, manager only)
router.post(
  '/project-attachments/:projectId',
  authenticate,
  authorize('admin', 'manager'),
  uploadMiddleware,
  uploadProjectAttachment
);

// Get project attachments (project members, admin, manager)
router.get(
  '/project-attachments/:projectId',
  authenticate,
  getProjectAttachments
);

// Download project attachment (project members, admin, manager)
router.get(
  '/project-attachments/:projectId/:attachmentId/download',
  authenticate,
  downloadProjectAttachment
);

// Delete project attachment (admin, manager, or uploader)
router.delete(
  '/project-attachments/:projectId/:attachmentId',
  authenticate,
  deleteProjectAttachment
);

export default router;
