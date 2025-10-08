import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import db from '../config/database';

// Configure multer for in-memory storage (BLOB)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (will be configurable)
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedExtensions = /\.(jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar)$/i;
    const extname = allowedExtensions.test(file.originalname);

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
    }
  }
});

// Helper function to get attachment configuration
const getAttachmentConfig = async (configKey: string) => {
  const config = await db('attachment_config')
    .where({ config_key: configKey, is_active: true })
    .first();
  
  if (!config) return null;
  
  try {
    return JSON.parse(config.config_value);
  } catch {
    return config.config_value;
  }
};

// Helper function to validate file against configuration
const validateFileUpload = async (file: Express.Multer.File) => {
  const maxSize = await getAttachmentConfig('max_file_size');
  const allowedTypes = await getAttachmentConfig('allowed_file_types');
  
  // Check file size
  if (maxSize && file.size > maxSize.value) {
    throw new Error(`File size exceeds maximum limit of ${maxSize.display_value}${maxSize.unit}`);
  }
  
  // Check MIME type
  if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
    throw new Error('File type not allowed');
  }
  
  return true;
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const {
      project_id,
      title,
      description,
      priority,
      status,
      complexity,
      due_date,
      estimated_hours,
      assigned_to,
      parent_task_id,
    } = req.body;
    const created_by = req.user?.id;

    if (!project_id || !title) {
      return res.status(400).json({ error: 'Project ID and title are required' });
    }

    const [task] = await db('tasks')
      .insert({
        project_id,
        title,
        description,
        priority: priority || 'medium',
        status: status || 'todo',
        complexity: complexity || 3,
        due_date,
        estimated_hours,
        assigned_to,
        created_by,
        parent_task_id,
      })
      .returning('*');

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const { project_id, assigned_to, status, priority } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;


    let query = db('tasks')
      .select(
        'tasks.*',
        'assigned_user.first_name as assigned_first_name',
        'assigned_user.last_name as assigned_last_name',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'projects.title as project_title'
      )
      .leftJoin('users as assigned_user', 'tasks.assigned_to', 'assigned_user.id')
      .leftJoin('users as creator', 'tasks.created_by', 'creator.id')
      .leftJoin('projects', 'tasks.project_id', 'projects.id');

    // Filter tasks based on user role
    if (userRole === 'member') {
      // Members can only see tasks from projects they are part of
      query = query
        .join('project_members', 'tasks.project_id', 'project_members.project_id')
        .where('project_members.user_id', userId);
    } else if (userRole === 'lead') {
      // Leads can only see tasks from projects they are part of
      query = query
        .join('project_members', 'tasks.project_id', 'project_members.project_id')
        .where('project_members.user_id', userId);
    }
    // Admin and Manager can see all tasks (no additional filtering)

    if (project_id) {
      query = query.where('tasks.project_id', project_id);
    }

    if (assigned_to && assigned_to !== 'undefined') {
      query = query.where('tasks.assigned_to', assigned_to);
    }

    if (status) {
      query = query.where('tasks.status', status);
    }

    if (priority) {
      query = query.where('tasks.priority', priority);
    }

    const tasks = await query.orderBy('tasks.created_at', 'desc');


    res.json({ tasks });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await db('tasks')
      .where({ 'tasks.id': id })
      .select(
        'tasks.*',
        'assigned_user.first_name as assigned_first_name',
        'assigned_user.last_name as assigned_last_name',
        'assigned_user.email as assigned_email',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'projects.title as project_title'
      )
      .leftJoin('users as assigned_user', 'tasks.assigned_to', 'assigned_user.id')
      .leftJoin('users as creator', 'tasks.created_by', 'creator.id')
      .leftJoin('projects', 'tasks.project_id', 'projects.id')
      .first();

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get subtasks
    const subtasks = await db('tasks')
      .where({ parent_task_id: id })
      .select('*');

    task.subtasks = subtasks;

    // Get dependencies
    const dependencies = await db('task_dependencies')
      .where({ task_id: id })
      .select('task_dependencies.*', 'tasks.title as depends_on_title')
      .join('tasks', 'task_dependencies.depends_on_task_id', 'tasks.id');

    task.dependencies = dependencies;

    // Get attachments
    const attachments = await db('attachments')
      .where({ task_id: id })
      .select('*');

    task.attachments = attachments;

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const {
      title,
      description,
      priority,
      status,
      complexity,
      due_date,
      estimated_hours,
      assigned_to,
    } = req.body;

    // Check if task exists
    const existingTask = await db('tasks').where({ id }).first();
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Permission check: Admin/Manager can edit any task, assigned user can edit their tasks
    const canEdit = userRole === 'admin' || 
                   userRole === 'manager' || 
                   existingTask.assigned_to === userId ||
                   existingTask.created_by === userId;

    if (!canEdit) {
      return res.status(403).json({ error: 'You do not have permission to edit this task' });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (complexity !== undefined) updateData.complexity = complexity;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (estimated_hours !== undefined) updateData.estimated_hours = estimated_hours;
    
    // Admin/manager, task creator, or assigned user can reassign (check only if assignee is actually changing)
    if (assigned_to !== undefined && assigned_to !== existingTask.assigned_to) {
      if (userRole === 'admin' || 
          userRole === 'manager' || 
          existingTask.created_by === userId || 
          existingTask.assigned_to === userId) {
        updateData.assigned_to = assigned_to;
      } else {
        return res.status(403).json({ error: 'You do not have permission to reassign this task' });
      }
    } else if (assigned_to !== undefined) {
      // If assigned_to is provided but same as current, just include it in update
      updateData.assigned_to = assigned_to;
    }

    const [task] = await db('tasks')
      .where({ id })
      .update(updateData)
      .returning('*');

    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await db('tasks').where({ id }).del();

    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

export const addTaskDependency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { depends_on_task_id } = req.body;

    if (!depends_on_task_id) {
      return res.status(400).json({ error: 'Depends on task ID is required' });
    }

    // Check if both tasks exist
    const task = await db('tasks').where({ id }).first();
    const dependsOnTask = await db('tasks').where({ id: depends_on_task_id }).first();

    if (!task || !dependsOnTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check for circular dependency
    if (Number(id) === Number(depends_on_task_id)) {
      return res.status(400).json({ error: 'Task cannot depend on itself' });
    }

    const [dependency] = await db('task_dependencies')
      .insert({
        task_id: id,
        depends_on_task_id,
      })
      .returning('*');

    res.status(201).json({ message: 'Dependency added successfully', dependency });
  } catch (error) {
    console.error('Add task dependency error:', error);
    if (error instanceof Error && error.message.includes('unique')) {
      return res.status(409).json({ error: 'Dependency already exists' });
    }
    res.status(500).json({ error: 'Failed to add dependency' });
  }
};

export const removeTaskDependency = async (req: Request, res: Response) => {
  try {
    const { id, dependencyId } = req.params;

    const deleted = await db('task_dependencies')
      .where({ task_id: id, id: dependencyId })
      .del();

    if (!deleted) {
      return res.status(404).json({ error: 'Dependency not found' });
    }

    res.json({ message: 'Dependency removed successfully' });
  } catch (error) {
    console.error('Remove task dependency error:', error);
    res.status(500).json({ error: 'Failed to remove dependency' });
  }
};

// Task Comments
export const getTaskComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);

    const comments = await db('task_comments')
      .where({ task_id: taskId })
      .select(
        'task_comments.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .join('users', 'task_comments.user_id', 'users.id')
      .orderBy('task_comments.created_at', 'asc');

    res.json({ comments });
  } catch (error) {
    console.error('Get task comments error:', error);
    res.status(500).json({ error: 'Failed to fetch task comments' });
  }
};

export const addTaskComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);
    const { comment } = req.body;
    const userId = req.user?.id;


    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    // Check if task exists
    const task = await db('tasks').where({ id: taskId }).first();
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [newComment] = await db('task_comments')
      .insert({
        task_id: taskId,
        user_id: userId,
        comment: comment.trim(),
      })
      .returning('*');

    res.status(201).json({ comment: newComment });
  } catch (error) {
    console.error('Add task comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

export const updateTaskComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const taskId = parseInt(id);
    const commentIdInt = parseInt(commentId);
    const { comment } = req.body;
    const userId = req.user?.id;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    // Check if comment exists and belongs to user
    const existingComment = await db('task_comments')
      .where({ id: commentIdInt, task_id: taskId, user_id: userId })
      .first();

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found or you do not have permission to edit it' });
    }

    const [updatedComment] = await db('task_comments')
      .where({ id: commentIdInt })
      .update({ comment: comment.trim() })
      .returning('*');

    // Get user details for the comment
    const commentWithUser = await db('task_comments')
      .where({ id: updatedComment.id })
      .select(
        'task_comments.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .join('users', 'task_comments.user_id', 'users.id')
      .first();

    res.json({ comment: commentWithUser });
  } catch (error) {
    console.error('Update task comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

export const deleteTaskComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const taskId = parseInt(id);
    const commentIdInt = parseInt(commentId);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Check if comment exists
    const existingComment = await db('task_comments')
      .where({ id: commentIdInt, task_id: taskId })
      .first();

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Permission check: User can delete their own comments, admin/manager can delete any
    const canDelete = userRole === 'admin' || 
                     userRole === 'manager' || 
                     existingComment.user_id === userId;

    if (!canDelete) {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
    }

    await db('task_comments').where({ id: commentIdInt }).del();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete task comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Task Attachments
export const getTaskAttachments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);

    const attachments = await db('attachments')
      .where({ task_id: taskId })
      .select(
        'attachments.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .join('users', 'attachments.uploaded_by', 'users.id')
      .orderBy('attachments.created_at', 'desc');

    res.json({ attachments });
  } catch (error) {
    console.error('Get task attachments error:', error);
    res.status(500).json({ error: 'Failed to fetch task attachments' });
  }
};

export const deleteTaskAttachment = async (req: Request, res: Response) => {
  try {
    const { id, attachmentId } = req.params;
    const taskId = parseInt(id);
    const attachmentIdInt = parseInt(attachmentId);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Check if attachment exists
    const existingAttachment = await db('attachments')
      .where({ id: attachmentIdInt, task_id: taskId })
      .first();

    if (!existingAttachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Permission check: User can delete their own attachments, admin/manager can delete any
    const canDelete = userRole === 'admin' || 
                     userRole === 'manager' || 
                     existingAttachment.uploaded_by === userId;

    if (!canDelete) {
      return res.status(403).json({ error: 'You do not have permission to delete this attachment' });
    }

    // TODO: Also delete the actual file from storage
    await db('attachments').where({ id: attachmentIdInt }).del();

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete task attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
};

export const uploadTaskAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { url, description } = req.body; // For URL attachments

    // Check if task exists
    const task = await db('tasks').where({ id: taskId }).first();
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Permission check: Admin/Manager can upload to any task, assigned user can upload to their tasks
    const canUpload = userRole === 'admin' || 
                     userRole === 'manager' || 
                     task.assigned_to === userId ||
                     task.created_by === userId;

    if (!canUpload) {
      return res.status(403).json({ error: 'You do not have permission to upload attachments to this task' });
    }

    let attachmentData: any = {
      task_id: taskId,
      uploaded_by: userId,
    };

    // Handle URL attachment
    if (url) {
      const urlConfig = await getAttachmentConfig('enable_url_attachments');
      if (!urlConfig || !urlConfig.enabled) {
        return res.status(400).json({ error: 'URL attachments are not enabled' });
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      // Check HTTPS requirement
      if (urlConfig.require_https && !url.startsWith('https://')) {
        return res.status(400).json({ error: 'HTTPS URLs are required' });
      }

      attachmentData = {
        ...attachmentData,
        attachment_type: 'url',
        file_url: url,
        file_name: description || url.split('/').pop() || 'External Link',
        file_type: 'application/octet-stream', // Generic type for URLs
        file_size: 0,
        mime_type: 'application/octet-stream',
      };
    }
    // Handle file upload
    else if (req.file) {
      // Validate file against configuration
      await validateFileUpload(req.file);

      // Generate file hash for integrity
      const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

      attachmentData = {
        ...attachmentData,
        attachment_type: 'file',
        file_name: req.file.originalname,
        file_content: req.file.buffer, // Store as BLOB
        file_type: req.file.mimetype,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        file_hash: fileHash,
      };
    }
    else {
      return res.status(400).json({ error: 'Either file or URL must be provided' });
    }

    // Save attachment record to database
    const [attachment] = await db('attachments')
      .insert(attachmentData)
      .returning('*');

        // Get user details for the attachment
        const attachmentWithUser = await db('attachments')
          .where({ 'attachments.id': attachment.id })
          .select(
            'attachments.id',
            'attachments.task_id',
            'attachments.file_name',
            'attachments.file_type',
            'attachments.file_size',
            'attachments.attachment_type',
            'attachments.file_url',
            'attachments.file_hash',
            'attachments.mime_type',
            'attachments.uploaded_by',
            'attachments.created_at',
            'attachments.updated_at',
            'users.first_name',
            'users.last_name',
            'users.email'
          )
          .leftJoin('users', 'attachments.uploaded_by', 'users.id')
          .first();

    res.status(201).json({ attachment: attachmentWithUser });
  } catch (error) {
    console.error('Upload task attachment error:', error);
    if (error instanceof Error && error.message.includes('exceeds maximum limit')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
};

export const downloadTaskAttachment = async (req: Request, res: Response) => {
  try {
    const { id, attachmentId } = req.params;
    const taskId = parseInt(id);
    const attachmentIdInt = parseInt(attachmentId);

    // Note: Authentication is handled by middleware, but token can be passed via query param
    // This is handled in the route configuration

    // Get attachment from database
    const attachment = await db('attachments')
      .where({ id: attachmentIdInt, task_id: taskId })
      .first();

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Verify user has access to this task
    const task = await db('tasks').where({ id: taskId }).first();
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has access to this task
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Admin and Manager can access all attachments
    // Otherwise, check if user is assigned to the task or is the creator
    if (userRole !== 'admin' && userRole !== 'manager') {
      const hasAccess = task.assigned_to === userId || task.created_by === userId;
      
      // For Lead role, check if they're involved in the project
      if (!hasAccess && userRole === 'lead') {
        const projectMember = await db('project_members')
          .where({ project_id: task.project_id, user_id: userId })
          .first();
        
        if (!projectMember) {
          return res.status(403).json({ error: 'You do not have access to this attachment' });
        }
      } else if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this attachment' });
      }
    }

    // Handle URL attachment - redirect to URL
    if (attachment.attachment_type === 'url') {
      return res.redirect(attachment.file_url);
    }

    // Handle file attachment - serve from BLOB
    if (attachment.attachment_type === 'file' && attachment.file_content) {
      res.setHeader('Content-Type', attachment.mime_type || attachment.file_type);
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.file_name}"`);
      res.setHeader('Content-Length', attachment.file_size);
      
      return res.send(attachment.file_content);
    }

    return res.status(404).json({ error: 'File content not found' });
  } catch (error) {
    console.error('Download task attachment error:', error);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
};

