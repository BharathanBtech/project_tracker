import { Router } from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
  getProjectMembers,
} from '../controllers/projectController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('admin', 'manager'), createProject);
router.get('/', authenticate, getAllProjects);
router.get('/:id', authenticate, getProjectById);
router.patch('/:id', authenticate, authorize('admin', 'manager'), updateProject);
router.patch('/:id/status', authenticate, authorize('admin', 'manager', 'lead'), updateProjectStatus);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteProject);

// Project members
router.get('/:id/members', authenticate, getProjectMembers);
router.post('/:id/members', authenticate, authorize('admin', 'manager', 'lead'), addProjectMember);
router.delete('/:id/members/:memberId', authenticate, authorize('admin', 'manager', 'lead'), removeProjectMember);
router.patch('/:id/members/:memberId', authenticate, authorize('admin', 'manager', 'lead'), updateProjectMemberRole);

export default router;

