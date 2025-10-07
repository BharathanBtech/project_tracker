import { Router } from 'express';
import {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveStatus,
  deleteLeaveRequest,
} from '../controllers/leaveController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createLeaveRequest);
router.get('/', authenticate, getLeaveRequests);
router.patch('/:id/status', authenticate, authorize('admin', 'manager', 'lead'), updateLeaveStatus);
router.delete('/:id', authenticate, deleteLeaveRequest);

export default router;

