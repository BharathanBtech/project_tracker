import { Router } from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addTaskDependency,
  removeTaskDependency,
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createTask);
router.get('/', authenticate, getAllTasks);
router.get('/:id', authenticate, getTaskById);
router.patch('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

// Task dependencies
router.post('/:id/dependencies', authenticate, addTaskDependency);
router.delete('/:id/dependencies/:dependencyId', authenticate, removeTaskDependency);

export default router;

