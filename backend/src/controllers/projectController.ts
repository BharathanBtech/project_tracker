import { Request, Response } from 'express';
import db from '../config/database';

export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description, start_date, end_date, status } = req.body;
    const created_by = req.user?.id;

    console.log('Create project request:', { title, description, start_date, end_date, status, created_by });
    console.log('User from request:', req.user);

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!created_by) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const [project] = await db('projects')
      .insert({
        title,
        description,
        start_date,
        end_date,
        status: status || 'active',
        created_by,
      })
      .returning('*');

    console.log('Project created successfully:', project);
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;


    let query = db('projects')
      .select(
        'projects.*',
        'users.first_name as creator_first_name',
        'users.last_name as creator_last_name'
      )
      .leftJoin('users', 'projects.created_by', 'users.id');

    // Filter projects based on user role
    if (userRole === 'member') {
      // Members can only see projects they are part of
      query = query
        .join('project_members', 'projects.id', 'project_members.project_id')
        .where('project_members.user_id', userId);
    } else if (userRole === 'lead') {
      // Leads can only see projects they are part of
      query = query
        .join('project_members', 'projects.id', 'project_members.project_id')
        .where('project_members.user_id', userId);
    }
    // Admin and Manager can see all projects (no additional filtering)

    if (status) {
      query = query.where('projects.status', status);
    }

    const projects = await query.orderBy('projects.created_at', 'desc');


    // Get member count for each project
    for (const project of projects) {
      const [{ count }] = await db('project_members')
        .where({ project_id: project.id })
        .count('* as count');
      project.member_count = Number(count);
    }

    res.json({ projects });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let query = db('projects')
      .where({ 'projects.id': id })
      .select(
        'projects.*',
        'users.first_name as creator_first_name',
        'users.last_name as creator_last_name'
      )
      .leftJoin('users', 'projects.created_by', 'users.id');

    // For leads and members, check if they are part of the project
    if (userRole === 'member' || userRole === 'lead') {
      const isMember = await db('project_members')
        .where({ project_id: id, user_id: userId })
        .first();
      
      if (!isMember) {
        return res.status(403).json({ error: 'Access denied. You are not a member of this project.' });
      }
    }

    const project = await query.first();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get project members with their details
    const members = await db('project_members')
      .where({ project_id: id })
      .select(
        'project_members.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.avatar_url',
        'users.department'
      )
      .join('users', 'project_members.user_id', 'users.id');

    project.members = members;

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, status } = req.body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (status) updateData.status = status;

    const [project] = await db('projects')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const updateProjectStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'on_hold', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: active, on_hold, or completed' });
    }

    const [project] = await db('projects')
      .where({ id })
      .update({ status })
      .returning('*');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project status updated successfully', project });
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ error: 'Failed to update project status' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await db('projects').where({ id }).del();

    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

export const addProjectMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, project_role } = req.body;

    if (!user_id || !project_role) {
      return res.status(400).json({ error: 'User ID and project role are required' });
    }

    // Check if project exists
    const project = await db('projects').where({ id }).first();
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user exists
    const user = await db('users').where({ id: user_id }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if member already exists
    const existingMember = await db('project_members')
      .where({ project_id: id, user_id })
      .first();

    if (existingMember) {
      return res.status(409).json({ error: 'User is already a member of this project' });
    }

    const [member] = await db('project_members')
      .insert({
        project_id: id,
        user_id,
        project_role,
      })
      .returning('*');

    res.status(201).json({ message: 'Member added successfully', member });
  } catch (error) {
    console.error('Add project member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

export const removeProjectMember = async (req: Request, res: Response) => {
  try {
    const { id, memberId } = req.params;

    const deleted = await db('project_members')
      .where({ project_id: id, id: memberId })
      .del();

    if (!deleted) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove project member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

export const updateProjectMemberRole = async (req: Request, res: Response) => {
  try {
    const { id, memberId } = req.params;
    const { project_role } = req.body;

    if (!project_role) {
      return res.status(400).json({ error: 'Project role is required' });
    }

    const [member] = await db('project_members')
      .where({ project_id: id, id: memberId })
      .update({ project_role })
      .returning('*');

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member role updated successfully', member });
  } catch (error) {
    console.error('Update project member role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
};

export const getProjectMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const members = await db('project_members')
      .where({ project_id: id })
      .select(
        'project_members.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.avatar_url',
        'users.department',
        'users.role as system_role'
      )
      .join('users', 'project_members.user_id', 'users.id');

    res.json({ members });
  } catch (error) {
    console.error('Get project members error:', error);
    res.status(500).json({ error: 'Failed to fetch project members' });
  }
};

