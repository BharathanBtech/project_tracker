import React, { useEffect, useState } from 'react';
import { FiSave, FiRefreshCw, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

interface PermissionMatrix {
  [role: string]: {
    [permission: string]: boolean;
  };
}

const RolePermissionsSettings = () => {
  const [permissions, setPermissions] = useState<PermissionMatrix>({
    admin: {},
    manager: {},
    lead: {},
    member: {},
    task_assignee: {},
    task_creator: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Define all available permissions with descriptions organized by category
  const permissionCategories = [
    {
      name: 'User Management',
      permissions: [
        {
          key: 'canViewUsers',
          label: 'View Users',
          description: 'View user list and profiles',
          roles: ['admin', 'manager', 'lead', 'member']
        },
        {
          key: 'canManageUsers',
          label: 'Manage Users',
          description: 'Create, edit, and delete users',
          roles: ['admin', 'manager', 'lead', 'member']
        }
      ]
    },
    {
      name: 'Project Management',
      permissions: [
        {
          key: 'canCreateProjects',
          label: 'Create Projects',
          description: 'Create new projects',
          roles: ['admin', 'manager', 'lead', 'member']
        },
        {
          key: 'canDeleteProjects',
          label: 'Delete Projects',
          description: 'Delete existing projects',
          roles: ['admin', 'manager', 'lead', 'member']
        },
        {
          key: 'canViewAllProjects',
          label: 'View All Projects',
          description: 'View all projects in the system',
          roles: ['admin', 'manager', 'lead', 'member']
        },
        {
          key: 'canManageProjectMembers',
          label: 'Manage Project Members',
          description: 'Add/remove members from projects',
          roles: ['admin', 'manager', 'lead', 'member']
        }
      ]
    },
    {
      name: 'Task Management',
      permissions: [
        {
          key: 'canViewAllTasks',
          label: 'View All Tasks',
          description: 'View all tasks across projects',
          roles: ['admin', 'manager', 'lead', 'member']
        },
        {
          key: 'canEditBasicTaskDetails',
          label: 'Edit Basic Task Details',
          description: 'Edit task title, description, status, priority, etc.',
          roles: ['task_assignee', 'task_creator', 'admin', 'manager']
        },
        {
          key: 'canReassignTask',
          label: 'Reassign Task',
          description: 'Change task assignment to another user',
          roles: ['task_assignee', 'task_creator', 'admin', 'manager']
        },
        {
          key: 'canAddComments',
          label: 'Add Comments',
          description: 'Add comments to tasks',
          roles: ['task_assignee', 'task_creator', 'admin', 'manager']
        },
        {
          key: 'canEditOwnComments',
          label: 'Edit Own Comments',
          description: 'Edit comments created by self',
          roles: ['task_assignee', 'task_creator', 'admin', 'manager']
        },
        {
          key: 'canDeleteOwnComments',
          label: 'Delete Own Comments',
          description: 'Delete comments created by self',
          roles: ['task_assignee', 'task_creator', 'admin', 'manager']
        },
        {
          key: 'canDeleteAnyComments',
          label: 'Delete Any Comments',
          description: 'Delete any user\'s comments',
          roles: ['task_assignee', 'task_creator', 'admin', 'manager']
        },
        {
          key: 'canDeleteOwnAttachments',
          label: 'Delete Own Attachments',
          description: 'Delete attachments uploaded by self',
          roles: ['task_assignee', 'task_creator', 'admin', 'manager']
        },
        {
          key: 'canDeleteAnyAttachments',
          label: 'Delete Any Attachments',
          description: 'Delete any user\'s attachments',
          roles: ['task_assignee', 'task_creator', 'admin', 'manager']
        }
      ]
    },
    {
      name: 'Leave Management',
      permissions: [
        {
          key: 'canManageLeaveRequests',
          label: 'Manage Leave Requests',
          description: 'Approve/reject leave requests',
          roles: ['admin', 'manager', 'lead', 'member']
        }
      ]
    },
    {
      name: 'System Administration',
      permissions: [
        {
          key: 'canAccessSettings',
          label: 'Access Settings',
          description: 'Access system settings and configuration',
          roles: ['admin', 'manager', 'lead', 'member']
        }
      ]
    }
  ];

  const roleDefinitions = [
    { key: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800', description: 'Full system access' },
    { key: 'manager', label: 'Manager', color: 'bg-blue-100 text-blue-800', description: 'Manage teams and projects' },
    { key: 'lead', label: 'Lead', color: 'bg-green-100 text-green-800', description: 'Lead project teams' },
    { key: 'member', label: 'Member', color: 'bg-gray-100 text-gray-800', description: 'Team member access' },
    { key: 'task_assignee', label: 'Task Assignee', color: 'bg-purple-100 text-purple-800', description: 'User assigned to task' },
    { key: 'task_creator', label: 'Task Creator', color: 'bg-yellow-100 text-yellow-800', description: 'User who created task' }
  ];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/permission-matrix');
      
      // If matrix is empty, initialize with defaults
      if (!response.data.matrix || Object.keys(response.data.matrix.admin || {}).length === 0) {
        const defaultPermissions: PermissionMatrix = {
          admin: {
            canViewUsers: true,
            canManageUsers: true,
            canCreateProjects: true,
            canDeleteProjects: true,
            canManageLeaveRequests: true,
            canViewAllProjects: true,
            canViewAllTasks: true,
            canManageProjectMembers: true,
            canAccessSettings: true,
            canEditBasicTaskDetails: true,
            canReassignTask: true,
            canAddComments: true,
            canEditOwnComments: true,
            canDeleteOwnComments: true,
            canDeleteAnyComments: true,
            canDeleteOwnAttachments: true,
            canDeleteAnyAttachments: true,
          },
          manager: {
            canViewUsers: true,
            canManageUsers: true,
            canCreateProjects: true,
            canDeleteProjects: true,
            canManageLeaveRequests: true,
            canViewAllProjects: true,
            canViewAllTasks: true,
            canManageProjectMembers: true,
            canAccessSettings: true,
            canEditBasicTaskDetails: true,
            canReassignTask: true,
            canAddComments: true,
            canEditOwnComments: true,
            canDeleteOwnComments: true,
            canDeleteAnyComments: true,
            canDeleteOwnAttachments: true,
            canDeleteAnyAttachments: true,
          },
          lead: {
            canViewUsers: true,
            canManageUsers: false,
            canCreateProjects: false,
            canDeleteProjects: false,
            canManageLeaveRequests: true,
            canViewAllProjects: false,
            canViewAllTasks: false,
            canManageProjectMembers: true,
            canAccessSettings: false,
            canEditBasicTaskDetails: false,
            canReassignTask: false,
            canAddComments: false,
            canEditOwnComments: false,
            canDeleteOwnComments: false,
            canDeleteAnyComments: false,
            canDeleteOwnAttachments: false,
            canDeleteAnyAttachments: false,
          },
          member: {
            canViewUsers: true,
            canManageUsers: false,
            canCreateProjects: false,
            canDeleteProjects: false,
            canManageLeaveRequests: false,
            canViewAllProjects: false,
            canViewAllTasks: false,
            canManageProjectMembers: false,
            canAccessSettings: false,
            canEditBasicTaskDetails: false,
            canReassignTask: false,
            canAddComments: false,
            canEditOwnComments: false,
            canDeleteOwnComments: false,
            canDeleteAnyComments: false,
            canDeleteOwnAttachments: false,
            canDeleteAnyAttachments: false,
          },
          task_assignee: {
            canEditBasicTaskDetails: true,
            canReassignTask: false,
            canAddComments: true,
            canEditOwnComments: true,
            canDeleteOwnComments: true,
            canDeleteAnyComments: false,
            canDeleteOwnAttachments: true,
            canDeleteAnyAttachments: false,
          },
          task_creator: {
            canEditBasicTaskDetails: true,
            canReassignTask: true,
            canAddComments: true,
            canEditOwnComments: true,
            canDeleteOwnComments: true,
            canDeleteAnyComments: false,
            canDeleteOwnAttachments: true,
            canDeleteAnyAttachments: false,
          }
        };
        setPermissions(defaultPermissions);
      } else {
        setPermissions(response.data.matrix);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (role: string, permission: string) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission]
      }
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      await api.put('/settings/permission-matrix', { matrix: permissions });
      toast.success('Permissions updated successfully');
    } catch (error: any) {
      console.error('Failed to save permissions:', error);
      toast.error(error.response?.data?.error || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = () => {
    if (window.confirm('Are you sure you want to reset all permissions to default values?')) {
      fetchPermissions();
      toast.success('Permissions reset to default');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role & Permission Management</h2>
          <p className="text-gray-600 mt-1">
            Configure granular permissions for each role and context in the system
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetPermissions}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FiRefreshCw size={16} />
            Reset to Default
          </button>
          <button
            onClick={handleSavePermissions}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <FiSave size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <FiInfo className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">Permission Management Guidelines</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li><strong>System Roles:</strong> Admin, Manager, Lead, Member - Apply globally across the system</li>
            <li><strong>Context Roles:</strong> Task Assignee, Task Creator - Apply only in specific contexts (e.g., assigned tasks)</li>
            <li>Admin role should maintain full system access for security purposes</li>
            <li>Changes take effect immediately after saving</li>
            <li>Users may need to refresh their session to see permission changes</li>
          </ul>
        </div>
      </div>

      {/* Permission Matrix by Category */}
      {permissionCategories.map((category) => (
        <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 sticky left-0 bg-gray-50 z-10 min-w-[250px]">
                    Permission
                  </th>
                  {roleDefinitions
                    .filter(role => category.permissions.some(p => p.roles.includes(role.key)))
                    .map(role => (
                      <th key={role.key} className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 min-w-[120px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${role.color}`}>
                            {role.label}
                          </span>
                          <span className="text-xs text-gray-500 font-normal">{role.description}</span>
                        </div>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {category.permissions.map(permission => {
                  const applicableRoles = roleDefinitions.filter(role => permission.roles.includes(role.key));
                  
                  return (
                    <tr key={permission.key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 sticky left-0 bg-white border-r border-gray-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{permission.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                        </div>
                      </td>
                      {applicableRoles.map(role => (
                        <td key={role.key} className="px-4 py-4 text-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions[role.key]?.[permission.key] || false}
                              onChange={() => handlePermissionToggle(role.key, permission.key)}
                              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {roleDefinitions.map(role => {
          const allPermissions = permissionCategories.flatMap(cat => cat.permissions.filter(p => p.roles.includes(role.key)));
          const enabledCount = allPermissions.filter(p => permissions[role.key]?.[p.key]).length;
          const totalCount = allPermissions.length;
          const percentage = totalCount > 0 ? Math.round((enabledCount / totalCount) * 100) : 0;
          
          return (
            <div key={role.key} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                  {role.label}
                </span>
                <span className="text-xl font-bold text-gray-900">{percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {enabledCount} of {totalCount} permissions
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RolePermissionsSettings;