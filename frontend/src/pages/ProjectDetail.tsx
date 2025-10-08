import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';
import { Project, Task, ProjectMember, User } from '../types';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUsers, FiCheckSquare, FiCalendar, FiEdit3, FiPlus, FiTrash2, FiX, FiSearch } from 'react-icons/fi';
import { ROLE_PERMISSIONS } from '../config/rolePermissions';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  
  // Team member management states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('developer');
  const [members, setMembers] = useState<ProjectMember[]>([]);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project_id=${id}`),
        api.get(`/projects/${id}/members`),
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks);
      setMembers(membersRes.data.members || []);
    } catch (error) {
      toast.error('Failed to fetch project details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser || !id) {
      toast.error('Please select a user');
      return;
    }

    try {
      await api.post(`/projects/${id}/members`, {
        user_id: selectedUser,
        project_role: selectedRole,
      });
      toast.success('Member added successfully');
      setShowAddMemberModal(false);
      setSelectedUser(null);
      setSelectedRole('developer');
      setSearchTerm('');
      fetchProjectDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      toast.success('Member removed successfully');
      fetchProjectDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleUpdateMemberRole = async (memberId: number, newRole: string) => {
    try {
      await api.patch(`/projects/${id}/members/${memberId}`, {
        project_role: newRole,
      });
      toast.success('Member role updated successfully');
      fetchProjectDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update member role');
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !id) return;
    
    try {
      const response = await api.patch(`/projects/${id}/status`, { status: newStatus });
      setProject(response.data.project);
      setShowStatusModal(false);
      setNewStatus('');
      toast.success('Project status updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update project status');
    }
  };

  const canUpdateStatus = ['admin', 'manager', 'lead'].includes(user?.role || '');
  const canManageMembers = user?.role ? ROLE_PERMISSIONS[user.role]?.canManageProjectMembers : false;

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch = 
      u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const notAlreadyMember = !members.some((m) => m.user_id === u.id);
    return matchesSearch && notAlreadyMember;
  });

  const projectRoles = [
    { value: 'developer', label: 'Developer' },
    { value: 'tester', label: 'Tester' },
    { value: 'business_analyst', label: 'Business Analyst' },
    { value: 'designer', label: 'Designer' },
    { value: 'devops', label: 'DevOps' },
    { value: 'project_manager', label: 'Project Manager' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      todo: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <FiArrowLeft />
        Back to Projects
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(
                project.status
              )}`}
            >
              {project.status.replace('_', ' ')}
            </span>
            {canUpdateStatus && (
              <button
                onClick={() => {
                  setNewStatus(project.status);
                  setShowStatusModal(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Update project status"
              >
                <FiEdit3 size={16} />
                Update Status
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="flex items-center gap-3">
            <FiUsers className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="font-semibold">{members.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiCheckSquare className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Tasks</p>
              <p className="font-semibold">{tasks.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiCalendar className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Timeline</p>
              <p className="font-semibold">
                {project.start_date
                  ? new Date(project.start_date).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
          {canManageMembers && (
            <button
              onClick={() => {
                setShowAddMemberModal(true);
                fetchAllUsers();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiPlus size={18} />
              Add Member
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.length > 0 ? (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {member.first_name[0]}
                      {member.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </p>
                    {canManageMembers ? (
                      <select
                        value={member.project_role}
                        onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                        className="text-sm text-gray-600 capitalize border-none bg-transparent cursor-pointer hover:text-primary-600 focus:ring-0 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {projectRoles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-600 capitalize">
                        {member.project_role.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>
                {canManageMembers && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove member"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-4">No team members yet</p>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tasks</h2>
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Assigned to: {task.assigned_first_name} {task.assigned_last_name || 'Unassigned'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-gray-500 capitalize">{task.priority} priority</span>
                  <span className="text-gray-500">{'⭐'.repeat(task.complexity)} Complexity</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No tasks yet</p>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Project Status</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <p className="text-lg font-medium text-gray-900 capitalize">
                {project?.status.replace('_', ' ')}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={newStatus === project?.status}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Team Member</h2>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSearchTerm('');
                  setSelectedUser(null);
                  setSelectedRole('developer');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Search Users */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Select Role */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {projectRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User List */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUser(u.id)}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser === u.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {u.first_name[0]}
                          {u.last_name[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {u.first_name} {u.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{u.email}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {u.role} {u.department && `• ${u.department}`}
                        </p>
                      </div>
                      {selectedUser === u.id && (
                        <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {searchTerm ? 'No users found' : 'All users are already members'}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSearchTerm('');
                  setSelectedUser(null);
                  setSelectedRole('developer');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;

