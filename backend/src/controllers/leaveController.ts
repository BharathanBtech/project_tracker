import { Request, Response } from 'express';
import db from '../config/database';

export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, reason } = req.body;
    const user_id = req.user?.id;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const [leave] = await db('leave_dates')
      .insert({
        user_id,
        start_date,
        end_date,
        reason,
        status: 'pending',
      })
      .returning('*');

    res.status(201).json({ message: 'Leave request created successfully', leave });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
};

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const { user_id, status } = req.query;

    let query = db('leave_dates')
      .select('leave_dates.*', 'users.first_name', 'users.last_name', 'users.email')
      .join('users', 'leave_dates.user_id', 'users.id');

    if (user_id) {
      query = query.where('leave_dates.user_id', user_id);
    }

    if (status) {
      query = query.where('leave_dates.status', status);
    }

    const leaves = await query.orderBy('leave_dates.start_date', 'desc');

    res.json({ leaves });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [leave] = await db('leave_dates')
      .where({ id })
      .update({ status })
      .returning('*');

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json({ message: 'Leave status updated successfully', leave });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ error: 'Failed to update leave status' });
  }
};

export const deleteLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await db('leave_dates').where({ id }).del();

    if (!deleted) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Delete leave request error:', error);
    res.status(500).json({ error: 'Failed to delete leave request' });
  }
};

