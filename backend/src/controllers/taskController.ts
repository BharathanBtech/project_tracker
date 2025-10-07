import { Request, Response } from 'express';
import db from '../config/database';

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

    if (project_id) {
      query = query.where('tasks.project_id', project_id);
    }

    if (assigned_to) {
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

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (complexity !== undefined) updateData.complexity = complexity;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (estimated_hours !== undefined) updateData.estimated_hours = estimated_hours;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;

    const [task] = await db('tasks')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

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

