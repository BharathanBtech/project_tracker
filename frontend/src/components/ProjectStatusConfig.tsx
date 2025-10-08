import React from 'react';
import { FiPlus, FiTrash2, FiFlag, FiCheckCircle } from 'react-icons/fi';

interface ProjectStatus {
  id?: number;
  status_name: string;
  status_color: string;
  status_order: number;
  description?: string;
  is_start_status: boolean;
  is_end_status: boolean;
}

interface ProjectStatusConfigProps {
  statuses: ProjectStatus[];
  onChange: (statuses: ProjectStatus[]) => void;
}

const ProjectStatusConfig: React.FC<ProjectStatusConfigProps> = ({ 
  statuses, 
  onChange 
}) => {
  const handleAddStatus = () => {
    const newStatus: ProjectStatus = {
      status_name: '',
      status_color: '#3B82F6', // Default blue
      status_order: statuses.length,
      description: '',
      is_start_status: statuses.length === 0,
      is_end_status: false,
    };
    onChange([...statuses, newStatus]);
  };

  const handleUpdateStatus = (index: number, updates: Partial<ProjectStatus>) => {
    const updated = statuses.map((status, i) => {
      if (i === index) {
        return { ...status, ...updates };
      }
      // If setting a new start status, unset the old one
      if (updates.is_start_status && status.is_start_status) {
        return { ...status, is_start_status: false };
      }
      // If setting a new end status, unset the old one
      if (updates.is_end_status && status.is_end_status) {
        return { ...status, is_end_status: false };
      }
      return status;
    });
    onChange(updated);
  };

  const handleDeleteStatus = (index: number) => {
    if (statuses.length <= 1) {
      alert('Cannot delete the last status');
      return;
    }
    const updated = statuses
      .filter((_, i) => i !== index)
      .map((status, i) => ({ ...status, status_order: i }));
    onChange(updated);
  };

  const handleMoveStatus = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === statuses.length - 1)
    ) {
      return;
    }

    // 'up' = move earlier in workflow (←), 'down' = move later in workflow (→)
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...statuses];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // Update order
    updated.forEach((status, i) => {
      status.status_order = i;
    });

    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Project Workflow</h3>
          <p className="text-sm text-gray-600">
            Configure the statuses that will define your project workflow
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddStatus}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <FiPlus size={16} />
          Add Status
        </button>
      </div>

      {/* Status List */}
      {statuses.length === 0 ? (
        <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <FiPlus size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium mb-2">No statuses configured</p>
          <p className="text-sm">Click "Add Status" to get started with your project workflow</p>
        </div>
      ) : (
        <div className="max-h-[600px] overflow-y-auto pr-2">
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {statuses.map((status, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-200 hover:shadow-sm transition-all"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {/* Order Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                    </div>
                    
                    {/* Move Buttons */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveStatus(index, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-primary-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors p-1.5 rounded hover:bg-gray-100"
                        title="Move earlier in workflow"
                      >
                        <span className="text-base font-bold">←</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStatus(index, 'down')}
                        disabled={index === statuses.length - 1}
                        className="text-gray-400 hover:text-primary-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors p-1.5 rounded hover:bg-gray-100"
                        title="Move later in workflow"
                      >
                        <span className="text-base font-bold">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteStatus(index)}
                    disabled={statuses.length <= 1}
                    className="text-red-400 hover:text-red-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors p-1.5 rounded-lg hover:bg-red-50"
                    title="Delete status"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                {/* Status Name */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status Name
                  </label>
                  <input
                    type="text"
                    value={status.status_name}
                    onChange={(e) => handleUpdateStatus(index, { status_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., In Progress"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={status.description || ''}
                    onChange={(e) => handleUpdateStatus(index, { description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Brief description"
                  />
                </div>

                {/* Status Type Flags */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={status.is_start_status}
                      onChange={(e) => handleUpdateStatus(index, { is_start_status: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-1">
                      <FiFlag size={14} className="text-green-600" />
                      <span className="text-xs font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                        Start Status
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={status.is_end_status}
                      onChange={(e) => handleUpdateStatus(index, { is_end_status: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-1">
                      <FiCheckCircle size={14} className="text-blue-600" />
                      <span className="text-xs font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                        End Status
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {statuses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FiCheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-3">Configuration Requirements</h4>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className={statuses.some(s => s.is_start_status) ? 'text-green-600' : 'text-amber-600'}>
                    {statuses.some(s => s.is_start_status) ? '✓' : '○'}
                  </span>
                  Mark exactly one status as <strong>Start Status</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className={statuses.some(s => s.is_end_status) ? 'text-green-600' : 'text-amber-600'}>
                    {statuses.some(s => s.is_end_status) ? '✓' : '○'}
                  </span>
                  Mark exactly one status as <strong>End Status</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className={statuses.every(s => s.status_name.trim()) ? 'text-green-600' : 'text-amber-600'}>
                    {statuses.every(s => s.status_name.trim()) ? '✓' : '○'}
                  </span>
                  All statuses must have names
                </li>
              </ul>
              
              {/* Error Messages */}
              {statuses.filter(s => s.is_start_status).length > 1 && (
                <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">⚠️ Only one status can be marked as start status</p>
                </div>
              )}
              {statuses.filter(s => s.is_end_status).length > 1 && (
                <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">⚠️ Only one status can be marked as end status</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusConfig;