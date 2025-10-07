export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
  description?: string;
}

export interface RolePermissions {
  [key: string]: {
    canViewUsers: boolean;
    canManageUsers: boolean;
    canCreateProjects: boolean;
    canDeleteProjects: boolean;
    canManageLeaveRequests: boolean;
    canViewAllProjects: boolean;
    canViewAllTasks: boolean;
    canManageProjectMembers: boolean;
  };
}

// Role-based permissions
export const ROLE_PERMISSIONS: RolePermissions = {
  admin: {
    canViewUsers: true,
    canManageUsers: true,
    canCreateProjects: true,
    canDeleteProjects: true,
    canManageLeaveRequests: true,
    canViewAllProjects: true,
    canViewAllTasks: true,
    canManageProjectMembers: true,
  },
  manager: {
    canViewUsers: true,
    canManageUsers: false,
    canCreateProjects: true,
    canDeleteProjects: true,
    canManageLeaveRequests: true,
    canViewAllProjects: true,
    canViewAllTasks: true,
    canManageProjectMembers: true,
  },
  lead: {
    canViewUsers: true,
    canManageUsers: false,
    canCreateProjects: true,
    canDeleteProjects: false,
    canManageLeaveRequests: false,
    canViewAllProjects: true,
    canViewAllTasks: true,
    canManageProjectMembers: true,
  },
  member: {
    canViewUsers: false,
    canManageUsers: false,
    canCreateProjects: false,
    canDeleteProjects: false,
    canManageLeaveRequests: false,
    canViewAllProjects: false,
    canViewAllTasks: false,
    canManageProjectMembers: false,
  },
};

// Navigation items with role-based access
export const getNavigationItems = (userRole: string): NavigationItem[] => {
  const allItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'FiHome',
      roles: ['admin', 'manager', 'lead', 'member'],
      description: 'Overview and statistics',
    },
    {
      name: 'My Projects',
      href: '/projects',
      icon: 'FiFolder',
      roles: ['admin', 'manager', 'lead', 'member'],
      description: 'Projects you are involved in',
    },
    {
      name: 'All Projects',
      href: '/projects/all',
      icon: 'FiFolderPlus',
      roles: ['admin', 'manager', 'lead'],
      description: 'All projects in the system',
    },
    {
      name: 'My Tasks',
      href: '/tasks',
      icon: 'FiCheckSquare',
      roles: ['admin', 'manager', 'lead', 'member'],
      description: 'Tasks assigned to you',
    },
    {
      name: 'All Tasks',
      href: '/tasks/all',
      icon: 'FiList',
      roles: ['admin', 'manager', 'lead'],
      description: 'All tasks in the system',
    },
    {
      name: 'Team',
      href: '/users',
      icon: 'FiUsers',
      roles: ['admin', 'manager', 'lead'],
      description: 'Team members directory',
    },
    {
      name: 'User Management',
      href: '/users/manage',
      icon: 'FiUserCheck',
      roles: ['admin', 'manager'],
      description: 'Manage user accounts and roles',
    },
    {
      name: 'Leave Requests',
      href: '/leaves',
      icon: 'FiCalendar',
      roles: ['admin', 'manager', 'lead', 'member'],
      description: 'Leave management',
    },
    {
      name: 'Leave Approvals',
      href: '/leaves/approve',
      icon: 'FiCheckCircle',
      roles: ['admin', 'manager', 'lead'],
      description: 'Approve/reject leave requests',
    },
  ];

  // Filter navigation items based on user role
  return allItems.filter(item => item.roles.includes(userRole));
};

// Helper function to check if user has specific permission
export const hasPermission = (userRole: string, permission: keyof RolePermissions['admin']): boolean => {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
};

// Get user's accessible routes
export const getAccessibleRoutes = (userRole: string): string[] => {
  const navigationItems = getNavigationItems(userRole);
  return navigationItems.map(item => item.href);
};
