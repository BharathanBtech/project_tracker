import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';
import { Project, Task } from '../types';
import {
  FiFolder,
  FiCheckSquare,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiArrowRight,
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    myTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes, myTasksRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks'),
        user?.id ? api.get(`/tasks?assigned_to=${user.id}`) : Promise.resolve({ data: { tasks: [] } }),
      ]);

      const projects = projectsRes.data.projects;
      const tasks = tasksRes.data.tasks;
      const userTasks = myTasksRes.data.tasks;

      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter((p: Project) => p.status === 'active').length,
        totalTasks: tasks.length,
        myTasks: userTasks.length,
        completedTasks: tasks.filter((t: Task) => t.status === 'done').length,
        pendingTasks: tasks.filter((t: Task) => t.status === 'todo').length,
      });

      setRecentProjects(projects.slice(0, 5));
      setMyTasks(userTasks.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'todo':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProjects}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.activeProjects} active
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FiFolder className="text-primary-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.myTasks}</p>
              <p className="text-sm text-gray-600 mt-1">Assigned to you</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckSquare className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedTasks}</p>
              <p className="text-sm text-gray-600 mt-1">Tasks done</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingTasks}</p>
              <p className="text-sm text-gray-600 mt-1">To be started</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiClock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
            >
              View all
              <FiArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No projects yet</p>
            ) : (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiUsers size={14} />
                      {project.member_count || 0} members
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
            <Link
              to="/tasks"
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
            >
              View all
              <FiArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {myTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tasks assigned</p>
            ) : (
              myTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.project_title}</p>
                    </div>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className={`font-medium capitalize ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-gray-500">
                      {'⭐'.repeat(task.complexity)} Complexity
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

