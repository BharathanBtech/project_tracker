import { Request, Response } from 'express';
import db from '../config/database';

// Get all statuses for a project
export const getProjectStatuses = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const statuses = await db('project_statuses')
      .where({ project_id: projectId, is_active: true })
      .orderBy('status_order', 'asc')
      .select('*');

    res.json({ statuses });
  } catch (error) {
    console.error('Get project statuses error:', error);
    res.status(500).json({ error: 'Failed to fetch project statuses' });
  }
};

// Create or update project statuses (bulk operation)
export const upsertProjectStatuses = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { statuses } = req.body;
    const userRole = req.user?.role;

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ error: 'Only admin and manager can configure project statuses' });
    }

    // Verify project exists
    const project = await db('projects').where({ id: projectId }).first();
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Validate statuses
    if (!statuses || !Array.isArray(statuses) || statuses.length === 0) {
      return res.status(400).json({ error: 'At least one status is required' });
    }

    // Validate that there's exactly one start and one end status
    const startStatuses = statuses.filter((s: any) => s.is_start_status);
    const endStatuses = statuses.filter((s: any) => s.is_end_status);

    if (startStatuses.length !== 1) {
      return res.status(400).json({ error: 'Exactly one start status is required' });
    }

    if (endStatuses.length !== 1) {
      return res.status(400).json({ error: 'Exactly one end status is required' });
    }

    // Use transaction
    await db.transaction(async (trx) => {
      // Delete existing statuses for this project
      await trx('project_statuses')
        .where({ project_id: projectId })
        .delete();

      // Insert new statuses
      const statusesToInsert = statuses.map((status: any, index: number) => ({
        project_id: projectId,
        status_name: status.status_name,
        status_color: status.status_color || '#3B82F6',
        status_order: index, // Use array index as order
        description: status.description || null,
        is_start_status: status.is_start_status || false,
        is_end_status: status.is_end_status || false,
        is_active: true,
      }));

      await trx('project_statuses').insert(statusesToInsert);
    });

    // Fetch and return updated statuses
    const updatedStatuses = await db('project_statuses')
      .where({ project_id: projectId, is_active: true })
      .orderBy('status_order', 'asc')
      .select('*');

    res.json({ 
      statuses: updatedStatuses,
      message: 'Project statuses updated successfully'
    });
  } catch (error) {
    console.error('Upsert project statuses error:', error);
    res.status(500).json({ error: 'Failed to update project statuses' });
  }
};

// Get default statuses template
export const getDefaultStatuses = async (req: Request, res: Response) => {
  try {
    const defaultStatuses = [
      { 
        status_name: 'Planning', 
        status_color: '#9CA3AF', 
        status_order: 0, 
        is_start_status: true, 
        is_end_status: false,
        description: 'Initial planning phase' 
      },
      { 
        status_name: 'In Progress', 
        status_color: '#3B82F6', 
        status_order: 1, 
        is_start_status: false,
        is_end_status: false,
        description: 'Active development' 
      },
      { 
        status_name: 'Review', 
        status_color: '#F59E0B', 
        status_order: 2, 
        is_start_status: false,
        is_end_status: false,
        description: 'Under review' 
      },
      { 
        status_name: 'Testing', 
        status_color: '#8B5CF6', 
        status_order: 3, 
        is_start_status: false,
        is_end_status: false,
        description: 'Quality assurance testing' 
      },
      { 
        status_name: 'Completed', 
        status_color: '#10B981', 
        status_order: 4, 
        is_start_status: false,
        is_end_status: true,
        description: 'Project completed' 
      },
    ];

    res.json({ statuses: defaultStatuses });
  } catch (error) {
    console.error('Get default statuses error:', error);
    res.status(500).json({ error: 'Failed to fetch default statuses' });
  }
};

// Delete a specific status
export const deleteProjectStatus = async (req: Request, res: Response) => {
  try {
    const { projectId, statusId } = req.params;
    const userRole = req.user?.role;

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ error: 'Only admin and manager can delete project statuses' });
    }

    // Check if status exists
    const status = await db('project_statuses')
      .where({ id: statusId, project_id: projectId })
      .first();

    if (!status) {
      return res.status(404).json({ error: 'Status not found' });
    }

    // Prevent deletion if it's the only status
    const statusCount = await db('project_statuses')
      .where({ project_id: projectId, is_active: true })
      .count('* as count')
      .first();

    if (statusCount && parseInt(statusCount.count as string) <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last status' });
    }

    // Soft delete
    await db('project_statuses')
      .where({ id: statusId })
      .update({ is_active: false });

    res.json({ message: 'Status deleted successfully' });
  } catch (error) {
    console.error('Delete project status error:', error);
    res.status(500).json({ error: 'Failed to delete status' });
  }
};
