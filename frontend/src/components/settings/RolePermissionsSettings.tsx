import React, { useEffect, useState } from 'react';
import { FiSave, FiShield, FiCheck, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

interface RolePermission {
  id: number;
  role: string;
  permission_key: string;
  is_enabled: boolean;
  description: string | null;
}

const RolePermissionsSettings = () => {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const roles = ['admin', 'manager', 'lead', 'member'];
  const roleLabels = {
    admin: 'Administrator',
    manager: 'Manager',
    lead: 'Lead Developer',
    member: 'Team Member'
  };

  const permissionGroups = {
    'User Management': [
      'can_view_users',
      'can_manage_users'
    ],
    'Project Management': [
      'can_create_projects',
      'can_edit_projects',
      'can_delete_projects',
      'can_view_all_projects',
      'can_manage_project_members'
    ],
    'Task Management': [
      'can_view_all_tasks'
    ],
    'Leave Management': [
      'can_manage_leave_requests'
    ],
    'System Access': [
      'can_access_settings'
    ]
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/role-permissions');
      setPermissions(response.data.permissions);
    } catch (error) {
      toast.error('Failed to fetch role permissions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (role: string, permissionKey: string, enabled: boolean) => {
    setPermissions(prev => 
      prev.map(permission => 
        permission.role === role && permission.permission_key === permissionKey
          ? { ...permission, is_enabled: enabled }
          : permission
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/settings/role-permissions', { permissions });
      toast.success('Role permissions updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update role permissions');
    } finally {
      setSaving(false);
    }
  };

  const getPermissionLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      'can_view_users': 'View Users',
      'can_manage_users': 'Manage Users',
      'can_create_projects': 'Create Projects',
      'can_edit_projects': 'Edit Projects',
      'can_delete_projects': 'Delete Projects',
      'can_view_all_projects': 'View All Projects',
      'can_manage_project_members': 'Manage Project Members',
      'can_view_all_tasks': 'View All Tasks',
      'can_manage_leave_requests': 'Manage Leave Requests',
      'can_access_settings': 'Access Settings'
    };
    return labels[key] || key;
  };

  const getPermissionDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      'can_view_users': 'View user profiles and information',
      'can_manage_users': 'Create, edit, and delete user accounts',
      'can_create_projects': 'Create new projects',
      'can_edit_projects': 'Edit existing projects',
      'can_delete_projects': 'Delete projects',
      'can_view_all_projects': 'View all projects in the system',
      'can_manage_project_members': 'Add/remove project members',
      'can_view_all_tasks': 'View tasks across all projects',
      'can_manage_leave_requests': 'Approve/reject leave requests',
      'can_access_settings': 'Access system settings and configuration'
    };
    return descriptions[key] || '';
  };

  const isPermissionEnabled = (role: string, permissionKey: string) => {
    const permission = permissions.find(p => p.role === role && p.permission_key === permissionKey);
    return permission?.is_enabled || false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role & Permissions</h2>
          <p className="text-gray-600 mt-1">Configure permissions for different user roles</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSave size={16} />
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Permissions Matrix */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions Matrix</h3>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Permission</th>
                  {roles.map((role) => (
                    <th key={role} className="text-center py-3 px-4 font-medium text-gray-700 min-w-[120px]">
                      {roleLabels[role as keyof typeof roleLabels]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionGroups).map(([groupName, permissionKeys]) => (
                  <React.Fragment key={groupName}>
                    <tr className="border-t border-gray-200">
                      <td colSpan={roles.length + 1} className="py-3 px-4">
                        <h4 className="font-semibold text-gray-800 text-sm">{groupName}</h4>
                      </td>
                    </tr>
                    {permissionKeys.map((permissionKey) => (
                      <tr key={permissionKey} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {getPermissionLabel(permissionKey)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {getPermissionDescription(permissionKey)}
                            </div>
                          </div>
                        </td>
                        {roles.map((role) => (
                          <td key={role} className="text-center py-3 px-4">
                            <button
                              onClick={() => handlePermissionToggle(
                                role, 
                                permissionKey, 
                                !isPermissionEnabled(role, permissionKey)
                              )}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isPermissionEnabled(role, permissionKey)
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              {isPermissionEnabled(role, permissionKey) ? (
                                <FiCheck size={16} />
                              ) : (
                                <FiX size={16} />
                              )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Summary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => {
              const rolePermissions = permissions.filter(p => p.role === role);
              const enabledCount = rolePermissions.filter(p => p.is_enabled).length;
              const totalCount = rolePermissions.length;

              return (
                <div key={role} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiShield className="text-primary-600" size={20} />
                    <h4 className="font-semibold text-gray-900">
                      {roleLabels[role as keyof typeof roleLabels]}
                    </h4>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {enabledCount} of {totalCount} permissions enabled
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(enabledCount / totalCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Permission Guidelines */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Permission Guidelines</h3>
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Administrator</h4>
                <p className="text-sm text-blue-800">
                  Full system access with all permissions enabled. Can manage users, projects, tasks, and system settings.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Manager</h4>
                <p className="text-sm text-blue-800">
                  Project and team management capabilities. Can create projects, manage team members, and approve leave requests.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Lead Developer</h4>
                <p className="text-sm text-blue-800">
                  Technical leadership role. Can view team members and manage project members, but cannot create or edit projects.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Team Member</h4>
                <p className="text-sm text-blue-800">
                  Basic access to assigned projects and tasks. Cannot manage other users or access system settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsSettings;
