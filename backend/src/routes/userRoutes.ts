import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deactivateUser,
  changePassword,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, getUserById);
router.patch('/:id', authenticate, updateUser);
router.patch('/:id/role', authenticate, authorize('admin', 'manager'), updateUserRole);
router.delete('/:id', authenticate, authorize('admin'), deactivateUser);
router.post('/:id/change-password', authenticate, changePassword);

export default router;

