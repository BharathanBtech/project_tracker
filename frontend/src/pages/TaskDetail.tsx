import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Task } from '../types';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${id}`);
      setTask(response.data.task);
    } catch (error) {
      toast.error('Failed to fetch task details');
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

  if (!task) {
    return <div>Task not found</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      todo: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Link to="/tasks" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <FiArrowLeft />
        Back to Tasks
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <Link to={`/projects/${task.project_id}`} className="text-primary-600 hover:underline mt-2 inline-block">
              {task.project_title}
            </Link>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>

        {task.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600">{task.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Priority</p>
            <p className="font-semibold capitalize mt-1">{task.priority}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Complexity</p>
            <p className="font-semibold mt-1">{'⭐'.repeat(task.complexity)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Assigned To</p>
            <p className="font-semibold mt-1">
              {task.assigned_first_name} {task.assigned_last_name || 'Unassigned'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-semibold mt-1">
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Subtasks</h2>
          <div className="space-y-2">
            {task.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                <span className="font-medium">{subtask.title}</span>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subtask.status)}`}>
                  {subtask.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;

