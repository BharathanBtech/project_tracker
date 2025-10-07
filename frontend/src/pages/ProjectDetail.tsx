import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Project, Task } from '../types';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUsers, FiCheckSquare, FiCalendar } from 'react-icons/fi';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project_id=${id}`),
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks);
    } catch (error) {
      toast.error('Failed to fetch project details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(
              project.status
            )}`}
          >
            {project.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="flex items-center gap-3">
            <FiUsers className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="font-semibold">{project.members?.length || 0}</p>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Team Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.members && project.members.length > 0 ? (
            project.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200"
              >
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
                  <p className="text-sm text-gray-600 capitalize">
                    {member.project_role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No team members yet</p>
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
    </div>
  );
};

export default ProjectDetail;

