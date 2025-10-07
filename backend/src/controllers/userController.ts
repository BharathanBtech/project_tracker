import { Request, Response } from 'express';
import db from '../config/database';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'department', 'avatar_url', 'is_active')
      .orderBy('first_name');

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await db('users')
      .where({ id })
      .select('id', 'email', 'first_name', 'last_name', 'role', 'department', 'avatar_url', 'is_active')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, department, avatar_url } = req.body;

    // Check if user can update (must be admin or updating own profile)
    if (req.user?.role !== 'admin' && req.user?.id !== Number(id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updateData: any = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (department) updateData.department = department;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const [user] = await db('users')
      .where({ id })
      .update(updateData)
      .returning(['id', 'email', 'first_name', 'last_name', 'role', 'department', 'avatar_url']);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'manager', 'lead', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const [user] = await db('users')
      .where({ id })
      .update({ role })
      .returning(['id', 'email', 'first_name', 'last_name', 'role']);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db('users').where({ id }).update({ is_active: false });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { old_password, new_password } = req.body;

    // Only allow users to change their own password
    if (req.user?.id !== Number(id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!old_password || !new_password) {
      return res.status(400).json({ error: 'Both old and new passwords are required' });
    }

    // Get user
    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(old_password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update password
    await db('users').where({ id }).update({ password_hash });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

