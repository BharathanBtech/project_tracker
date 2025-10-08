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

export const createUser = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password, role, department, is_active } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const [user] = await db('users')
      .insert({
        first_name,
        last_name,
        email,
        password_hash,
        role: role || 'member',
        department: department || null,
        is_active: is_active !== undefined ? is_active : true,
      })
      .returning(['id', 'email', 'first_name', 'last_name', 'role', 'department', 'is_active']);

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (req.user?.id === Number(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const deleted = await db('users').where({ id }).del();

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
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
    const { first_name, last_name, email, role, department, is_active, avatar_url } = req.body;

    // Check if user can update (must be admin or updating own profile)
    if (req.user?.role !== 'admin' && req.user?.id !== Number(id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // If not admin, restrict what can be updated
    if (req.user?.role !== 'admin') {
      // Non-admin users can only update their own basic info, not role or status
      if (role !== undefined || is_active !== undefined) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    const updateData: any = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const [user] = await db('users')
      .where({ id })
      .update(updateData)
      .returning(['id', 'email', 'first_name', 'last_name', 'role', 'department', 'is_active', 'avatar_url']);

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

