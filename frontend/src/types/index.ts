export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'lead' | 'member';
  department?: string;
  avatar_url?: string;
  is_active: boolean;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'on_hold' | 'completed';
  created_by: number;
  creator_first_name?: string;
  creator_last_name?: string;
  member_count?: number;
  members?: ProjectMember[];
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  project_role: 'developer' | 'tester' | 'business_analyst' | 'designer' | 'devops' | 'project_manager';
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  department?: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  complexity: number;
  due_date?: string;
  estimated_hours?: number;
  assigned_to?: number;
  assigned_first_name?: string;
  assigned_last_name?: string;
  created_by: number;
  creator_first_name?: string;
  creator_last_name?: string;
  project_title?: string;
  parent_task_id?: number;
  subtasks?: Task[];
  dependencies?: TaskDependency[];
  attachments?: Attachment[];
  comments?: TaskComment[];
  created_at: string;
  updated_at: string;
}

export interface TaskDependency {
  id: number;
  task_id: number;
  depends_on_task_id: number;
  depends_on_title?: string;
}

export interface Attachment {
  id: number;
  task_id: number;
  file_name: string;
  file_path?: string;
  file_type?: string;
  file_size?: number;
  attachment_type?: 'file' | 'url';
  file_url?: string;
  file_hash?: string;
  mime_type?: string;
  uploaded_by: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveDate {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  department?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

