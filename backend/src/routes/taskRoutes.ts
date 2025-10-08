import { Router } from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addTaskDependency,
  removeTaskDependency,
  getTaskComments,
  addTaskComment,
  updateTaskComment,
  deleteTaskComment,
  getTaskAttachments,
  deleteTaskAttachment,
  uploadTaskAttachment,
  downloadTaskAttachment,
  upload,
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

// Task comments
router.get('/:id/comments', authenticate, getTaskComments);
router.post('/:id/comments', authenticate, addTaskComment);
router.put('/:id/comments/:commentId', authenticate, updateTaskComment);
router.delete('/:id/comments/:commentId', authenticate, deleteTaskComment);

// Task attachments
router.get('/:id/attachments', authenticate, getTaskAttachments);
router.post('/:id/attachments', authenticate, (req, res, next) => {
  // Only apply multer middleware if content-type is multipart/form-data
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return upload.single('file')(req, res, next);
  }
  next();
}, uploadTaskAttachment);
router.get('/:id/attachments/:attachmentId/download', authenticate, downloadTaskAttachment);
router.delete('/:id/attachments/:attachmentId', authenticate, deleteTaskAttachment);

export default router;

