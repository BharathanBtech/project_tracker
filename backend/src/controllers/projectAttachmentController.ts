import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import multer from 'multer';
import crypto from 'crypto';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/zip',
      'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type') as any);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: 'Failed to upload document' });
    }
    next();
  });
};

export const uploadProjectAttachment = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { description } = req.body;
    const userId = req.user?.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if project exists and user has access
    const project = await db('projects').where({ id: projectId }).first();
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions - admin, manager, or project creator can upload
    if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && project.created_by !== userId) {
      return res.status(403).json({ error: 'You do not have permission to upload documents to this project' });
    }

    // Generate file hash
    const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    // Save attachment to database
    const [attachment] = await db('attachments')
      .insert({
        project_id: projectId,
        file_name: req.file.originalname,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        file_content: req.file.buffer, // Store as BLOB
        attachment_type: 'file',
        file_hash: fileHash,
        mime_type: req.file.mimetype,
        uploaded_by: userId,
        description: description || null,
      })
      .returning('*');

    // Get user details for the attachment
    const attachmentWithUser = await db('attachments')
      .where({ 'attachments.id': attachment.id })
      .select(
        'attachments.id',
        'attachments.project_id',
        'attachments.file_name',
        'attachments.file_type',
        'attachments.file_size',
        'attachments.attachment_type',
        'attachments.file_hash',
        'attachments.mime_type',
        'attachments.uploaded_by',
        'attachments.description',
        'attachments.created_at',
        'attachments.updated_at',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .leftJoin('users', 'attachments.uploaded_by', 'users.id')
      .first();

    res.status(201).json({ message: 'Document uploaded successfully', attachment: attachmentWithUser });
  } catch (error: any) {
    console.error('Upload project attachment error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

export const getProjectAttachments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Check if project exists and user has access
    const project = await db('projects').where({ id: projectId }).first();
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions - admin, manager, or project members can view attachments
    if (userRole !== 'admin' && userRole !== 'manager') {
      const isProjectMember = await db('project_members')
        .where({ project_id: projectId, user_id: userId })
        .first();
      
      if (!isProjectMember && project.created_by !== userId) {
        return res.status(403).json({ error: 'You do not have access to this project\'s documents' });
      }
    }

    // Get attachments with user details
    const attachments = await db('attachments')
      .where({ project_id: projectId, attachment_type: 'file' })
      .select(
        'attachments.id',
        'attachments.project_id',
        'attachments.file_name',
        'attachments.file_type',
        'attachments.file_size',
        'attachments.attachment_type',
        'attachments.file_hash',
        'attachments.mime_type',
        'attachments.uploaded_by',
        'attachments.description',
        'attachments.created_at',
        'attachments.updated_at',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .leftJoin('users', 'attachments.uploaded_by', 'users.id')
      .orderBy('attachments.created_at', 'desc');

    res.status(200).json({ attachments });
  } catch (error) {
    console.error('Get project attachments error:', error);
    res.status(500).json({ error: 'Failed to fetch project documents' });
  }
};

export const downloadProjectAttachment = async (req: Request, res: Response) => {
  try {
    const { projectId, attachmentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Get attachment from database
    const attachment = await db('attachments')
      .where({ id: attachmentId, project_id: projectId })
      .first();

    if (!attachment) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if project exists and user has access
    const project = await db('projects').where({ id: projectId }).first();
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'manager') {
      const isProjectMember = await db('project_members')
        .where({ project_id: projectId, user_id: userId })
        .first();
      
      if (!isProjectMember && project.created_by !== userId) {
        return res.status(403).json({ error: 'You do not have access to this document' });
      }
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
    console.error('Download project attachment error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
};

export const deleteProjectAttachment = async (req: Request, res: Response) => {
  try {
    const { projectId, attachmentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Get attachment from database
    const attachment = await db('attachments')
      .where({ id: attachmentId, project_id: projectId })
      .first();

    if (!attachment) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions - admin, manager, or uploader can delete
    if (userRole !== 'admin' && userRole !== 'manager' && attachment.uploaded_by !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this document' });
    }

    await db('attachments').where({ id: attachmentId }).del();

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete project attachment error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};
