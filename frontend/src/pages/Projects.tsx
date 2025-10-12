import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';
import { Project, ProjectStatus } from '../types';
import toast from 'react-hot-toast';
import { FiPlus, FiFolder, FiUsers, FiCalendar, FiSearch, FiEdit3 } from 'react-icons/fi';
import ProjectStatusConfig from '../components/ProjectStatusConfig';
import ProjectDocumentUpload from '../components/ProjectDocumentUpload';

const Projects = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [createStep, setCreateStep] = useState(1); // 1 = Basic Info, 2 = Status Config, 3 = Documents
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Planning',
  });
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<Array<{
    id?: string;
    file: File;
    name: string;
    type: string;
    size: number;
    description?: string;
    category: 'requirements' | 'specifications' | 'design' | 'other';
  }>>([]);

  useEffect(() => {
    fetchProjects();
    fetchDefaultStatuses();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const fetchDefaultStatuses = async () => {
    try {
      const response = await api.get('/project-statuses/default');
      setProjectStatuses(response.data.statuses);
    } catch (error) {
      console.error('Failed to fetch default statuses:', error);
      // Set hardcoded defaults if API fails
      setProjectStatuses([
        { status_name: 'Planning', status_color: '#9CA3AF', status_order: 0, is_start_status: true, is_end_status: false, description: 'Initial planning phase' },
        { status_name: 'In Progress', status_color: '#3B82F6', status_order: 1, is_start_status: false, is_end_status: false, description: 'Active development' },
        { status_name: 'Completed', status_color: '#10B981', status_order: 2, is_start_status: false, is_end_status: true, description: 'Project completed' },
      ]);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      // Backend already filters projects based on user role and membership
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Failed to fetch projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleCreateProject = async () => {
    
    // Validate statuses
    if (projectStatuses.length === 0) {
      toast.error('Please configure at least one status');
      return;
    }
    
    const startStatuses = projectStatuses.filter(s => s.is_start_status);
    const endStatuses = projectStatuses.filter(s => s.is_end_status);
    
    if (startStatuses.length !== 1) {
      toast.error('Please mark exactly one status as the start status');
      return;
    }
    
    if (endStatuses.length !== 1) {
      toast.error('Please mark exactly one status as the end status');
      return;
    }
    
    try {
      // Prepare project data - convert empty end_date to null
      const projectData = {
        ...formData,
        end_date: formData.end_date || null
      };
      
      // Create project
      const projectResponse = await api.post('/projects', projectData);
      const projectId = projectResponse.data.project.id;
      
      // Save statuses for the project
      await api.put(`/project-statuses/project/${projectId}`, { statuses: projectStatuses });
      
      // Upload documents if any
      if (projectDocuments.length > 0) {
        for (const doc of projectDocuments) {
          const docFormData = new FormData();
          docFormData.append('file', doc.file);
          docFormData.append('attachment_type', 'file');
          docFormData.append('description', doc.description || '');
          
          try {
            await api.post(`/project-attachments/${projectId}`, docFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (docError) {
            console.error('Failed to upload document:', doc.name, docError);
            toast.error(`Failed to upload document: ${doc.name}`);
          }
        }
      }
      
      toast.success('Project created successfully');
      setShowCreateModal(false);
      setCreateStep(1); // Reset to first step
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'Planning',
      });
      setProjectDocuments([]); // Reset documents
      fetchDefaultStatuses(); // Reset to defaults
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create project');
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedProject) return;
    
    try {
      await api.patch(`/projects/${selectedProject.id}/status`, { status: newStatus });
      toast.success('Project status updated successfully');
      setShowStatusModal(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update project status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canCreateProject = ['admin', 'manager'].includes(user?.role || '');
  const canUpdateStatus = ['admin', 'manager', 'lead'].includes(user?.role || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">
            {['admin', 'manager', 'lead'].includes(user?.role || '') 
              ? 'Projects you have access to'
              : 'Projects you are a member of'
            }
          </p>
        </div>
        {canCreateProject && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus size={20} />
            New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FiFolder className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No projects found</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FiFolder className="text-primary-600" size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                  {canUpdateStatus && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedProject(project);
                        setShowStatusModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Update status"
                    >
                      <FiEdit3 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FiUsers size={16} />
                  <span>{project.member_count || 0} team members</span>
                </div>
                {project.start_date && (
                  <div className="flex items-center gap-2">
                    <FiCalendar size={16} />
                    <span>
                      {new Date(project.start_date).toLocaleDateString()} -{' '}
                      {project.end_date
                        ? new Date(project.end_date).toLocaleDateString()
                        : 'Ongoing'}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Project Modal - Multi-Step Wizard */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
              
              {/* Step Indicator */}
              <div className="flex items-center mt-4">
                {/* Step 1 */}
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    createStep === 1 ? 'bg-primary-600 text-white' : createStep > 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {createStep > 1 ? '✓' : '1'}
                  </div>
                  <span className={`text-sm font-medium ${createStep === 1 ? 'text-primary-600' : createStep > 1 ? 'text-gray-600' : 'text-gray-400'}`}>
                    Basic Information
                  </span>
                </div>
                
                {/* Connector 1 */}
                <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
                
                {/* Step 2 */}
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    createStep === 2 ? 'bg-primary-600 text-white' : createStep > 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {createStep > 2 ? '✓' : '2'}
                  </div>
                  <span className={`text-sm font-medium ${createStep === 2 ? 'text-primary-600' : createStep > 2 ? 'text-gray-600' : 'text-gray-400'}`}>
                    Status Configuration
                  </span>
                </div>
                
                {/* Connector 2 */}
                <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
                
                {/* Step 3 */}
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    createStep === 3 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    3
                  </div>
                  <span className={`text-sm font-medium ${createStep === 3 ? 'text-primary-600' : 'text-gray-400'}`}>
                    Documents
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Content Area - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Step 1: Basic Information */}
                {createStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                        placeholder="Enter project title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                        placeholder="Enter project description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Project start date is required
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Optional - leave blank for ongoing projects
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Status Configuration */}
                {createStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Configure Project Workflow
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Define the statuses your project will go through from start to completion.
                      </p>
                      <ProjectStatusConfig
                        statuses={projectStatuses}
                        onChange={setProjectStatuses}
                      />
                    </div>

                    {/* Initial Status Selection */}
                    {projectStatuses.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Initial Status *
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                        >
                          {projectStatuses
                            .sort((a, b) => a.status_order - b.status_order)
                            .map((status) => (
                              <option key={status.status_name} value={status.status_name}>
                                {status.status_name}
                              </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Select the initial status for this project
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Document Upload */}
                {createStep === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Upload Supporting Documents
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add requirements, specifications, and other project-related files. This step is optional.
                      </p>
                      <ProjectDocumentUpload
                        documents={projectDocuments}
                        onChange={setProjectDocuments}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-3">
                  {createStep === 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          setCreateStep(1);
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!formData.title.trim()) {
                            toast.error('Please enter a project title');
                            return;
                          }
                          if (!formData.start_date) {
                            toast.error('Please select a start date');
                            return;
                          }
                          setCreateStep(2);
                        }}
                        className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                      >
                        Next: Configure Status
                      </button>
                    </>
                  ) : createStep === 2 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setCreateStep(1)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Validate step 2 before proceeding
                          if (projectStatuses.length === 0) {
                            toast.error('Please configure at least one status');
                            return;
                          }
                          
                          const startStatuses = projectStatuses.filter(s => s.is_start_status);
                          const endStatuses = projectStatuses.filter(s => s.is_end_status);
                          
                          if (startStatuses.length !== 1) {
                            toast.error('Please mark exactly one status as the start status');
                            return;
                          }
                          
                          if (endStatuses.length !== 1) {
                            toast.error('Please mark exactly one status as the end status');
                            return;
                          }
                          
                          setCreateStep(3);
                        }}
                        className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                      >
                        Next: Add Documents
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setCreateStep(2)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateProject}
                        className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                      >
                        Create Project
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Project Status</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project: {selectedProject.title}
              </label>
              <p className="text-sm text-gray-600">
                Current Status: <span className="font-medium capitalize">{selectedProject.status.replace('_', ' ')}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select New Status
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => handleStatusUpdate('active')}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium text-gray-900">Active</p>
                      <p className="text-sm text-gray-600">Project is in progress</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleStatusUpdate('on_hold')}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div>
                      <p className="font-medium text-gray-900">On Hold</p>
                      <p className="text-sm text-gray-600">Project is temporarily paused</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <div>
                      <p className="font-medium text-gray-900">Completed</p>
                      <p className="text-sm text-gray-600">Project has been finished</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

