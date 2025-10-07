export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  department?: string;
  role: 'admin' | 'manager' | 'lead' | 'member';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserPayload {
  id: number;
  email: string;
  role: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  status: 'active' | 'on_hold' | 'completed';
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  complexity: number;
  due_date?: Date;
  estimated_hours?: number;
  assigned_to?: number;
  created_by: number;
  parent_task_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveDate {
  id: number;
  user_id: number;
  start_date: Date;
  end_date: Date;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

