import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  deactivateUser,
  changePassword,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllUsers);
router.post('/', authenticate, authorize('admin'), createUser);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);
router.patch('/:id/role', authenticate, authorize('admin', 'manager'), updateUserRole);
router.patch('/:id/deactivate', authenticate, authorize('admin'), deactivateUser);
router.post('/:id/change-password', authenticate, changePassword);

export default router;

