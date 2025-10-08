import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';
import { Task, TaskComment, Attachment, User } from '../types';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEdit3, FiSave, FiX, FiMessageCircle, FiPaperclip, FiTrash2, FiPlus } from 'react-icons/fi';

const TaskDetail = () => {
  const { id } = useParams();
  const { user: currentUser, token } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [attachmentType, setAttachmentType] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [urlDescription, setUrlDescription] = useState('');

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in_progress' | 'done' | 'blocked',
    complexity: 3,
    due_date: '',
    estimated_hours: '',
    assigned_to: 0,
  });

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
      fetchComments();
      fetchAttachments();
      fetchUsers();
    }
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${id}`);
      setTask(response.data.task);
      setEditForm({
        title: response.data.task.title,
        description: response.data.task.description || '',
        priority: response.data.task.priority,
        status: response.data.task.status,
        complexity: response.data.task.complexity,
        due_date: response.data.task.due_date || '',
        estimated_hours: response.data.task.estimated_hours || '',
        assigned_to: response.data.task.assigned_to || 0,
      });
    } catch (error) {
      toast.error('Failed to fetch task details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/tasks/${id}/comments`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchAttachments = async () => {
    try {
      const response = await api.get(`/tasks/${id}/attachments`);
      setAttachments(response.data.attachments);
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSaveTask = async () => {
    try {
      const response = await api.patch(`/tasks/${id}`, editForm);
      setTask(response.data.task);
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/tasks/${id}/comments`, { comment: newComment });
      setComments([...comments, response.data.comment]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editCommentText.trim()) return;

    try {
      const response = await api.put(`/tasks/${id}/comments/${commentId}`, { comment: editCommentText });
      setComments(comments.map(c => c.id === commentId ? response.data.comment : c));
      setEditingComment(null);
      setEditCommentText('');
      toast.success('Comment updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/tasks/${id}/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete comment');
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;

    try {
      await api.delete(`/tasks/${id}/attachments/${attachmentId}`);
      setAttachments(attachments.filter(a => a.id !== attachmentId));
      toast.success('Attachment deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete attachment');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!id) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/tasks/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setAttachments([response.data.attachment, ...attachments]);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUrlAttachment = async () => {
    if (!id || !urlInput.trim()) return;

    setUploadingFile(true);
    try {
      const response = await api.post(`/tasks/${id}/attachments`, {
        url: urlInput.trim(),
        description: urlDescription.trim() || undefined,
      });
      
      setAttachments([response.data.attachment, ...attachments]);
      setUrlInput('');
      setUrlDescription('');
      toast.success('URL attachment added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add URL attachment');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const getDownloadUrl = (attachmentId: number) => {
    const baseUrl = `http://localhost:3001/api/tasks/${id}/attachments/${attachmentId}/download`;
    return token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;
  };

  const canEditTask = task && (
    currentUser?.role === 'admin' || 
    currentUser?.role === 'manager' || 
    task.assigned_to === currentUser?.id ||
    task.created_by === currentUser?.id
  );

  const canReassign = task && (
    currentUser?.role === 'admin' || 
    currentUser?.role === 'manager' || 
    task.created_by === currentUser?.id
  );

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

      {/* Task Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-primary-500 focus:outline-none w-full"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            )}
            <Link to={`/projects/${task.project_id}`} className="text-primary-600 hover:underline mt-2 inline-block">
              {task.project_title}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize border-2 ${getStatusColor(editForm.status)}`}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            ) : (
              <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            )}
            {canEditTask && (
              <button
                onClick={() => isEditing ? handleSaveTask() : setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                {isEditing ? <FiSave size={16} /> : <FiEdit3 size={16} />}
                {isEditing ? 'Save' : 'Edit'}
              </button>
            )}
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  fetchTaskDetails(); // Reset form
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiX size={16} />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
          {isEditing ? (
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
            />
          ) : (
            <p className="text-gray-600">{task.description || 'No description provided'}</p>
          )}
        </div>

        {/* Task Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Priority</p>
            {isEditing ? (
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <p className="font-semibold capitalize mt-1">{task.priority}</p>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Complexity</p>
            {isEditing ? (
              <select
                value={editForm.complexity}
                onChange={(e) => setEditForm({ ...editForm, complexity: Number(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{'⭐'.repeat(num)} ({num} star{num > 1 ? 's' : ''})</option>
                ))}
              </select>
            ) : (
              <p className="font-semibold mt-1">{'⭐'.repeat(task.complexity)}</p>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Assigned To</p>
            {isEditing && canReassign ? (
              <select
                value={editForm.assigned_to}
                onChange={(e) => setEditForm({ ...editForm, assigned_to: Number(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={0}>Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="font-semibold mt-1">
                {task.assigned_first_name} {task.assigned_last_name || 'Unassigned'}
              </p>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            {isEditing ? (
              <input
                type="date"
                value={editForm.due_date}
                onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            ) : (
              <p className="font-semibold mt-1">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
              </p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  value={editForm.estimated_hours}
                  onChange={(e) => setEditForm({ ...editForm, estimated_hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 8"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiMessageCircle size={20} />
            Comments ({comments.length})
          </h2>
        </div>

        {/* Add Comment - Only show when editing */}
        {isEditing && (
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600">
                        {comment.first_name?.[0]}{comment.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {comment.first_name} {comment.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isEditing && currentUser?.id === comment.user_id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditCommentText(comment.comment);
                        }}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                        title="Edit comment"
                      >
                        <FiEdit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete comment"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingComment === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingComment(null);
                          setEditCommentText('');
                        }}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">{comment.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiPaperclip size={20} />
            Attachments ({attachments.length})
          </h2>
        </div>

        {/* Upload Area - Only show when editing */}
        {isEditing && (
          <div className="mb-6">
          {/* Attachment Type Toggle */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700">Attachment Type:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setAttachmentType('file')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  attachmentType === 'file'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                File Upload
              </button>
              <button
                onClick={() => setAttachmentType('url')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  attachmentType === 'url'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                URL Link
              </button>
            </div>
          </div>

          {/* File Upload */}
          {attachmentType === 'file' && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${uploadingFile ? 'opacity-50 pointer-events-none' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FiPaperclip className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600 mb-2">
                {uploadingFile ? 'Uploading...' : 'Drag & drop files here or click to browse'}
              </p>
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
              >
                <FiPlus size={16} className="mr-2" />
                Choose File
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Supports: Images, PDFs, Documents, Archives (Max 5MB)
              </p>
            </div>
          )}

          {/* URL Attachment */}
          {attachmentType === 'url' && (
            <div className="space-y-4 p-4 border border-gray-300 rounded-lg">
              <div>
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  id="url-input"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/document.pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={uploadingFile}
                />
              </div>
              <div>
                <label htmlFor="url-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  id="url-description"
                  value={urlDescription}
                  onChange={(e) => setUrlDescription(e.target.value)}
                  placeholder="Brief description of the file"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={uploadingFile}
                />
              </div>
              <button
                onClick={handleUrlAttachment}
                disabled={!urlInput.trim() || uploadingFile}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding URL...
                  </>
                ) : (
                  <>
                    <FiPlus size={16} />
                    Add URL Attachment
                  </>
                )}
              </button>
            </div>
          )}
          </div>
        )}

        <div className="space-y-3">
          {attachments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No attachments yet</p>
          ) : (
            attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {attachment.attachment_type === 'url' ? (
                    <FiPaperclip className="text-blue-500" size={20} />
                  ) : (
                    <FiPaperclip className="text-gray-400" size={20} />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{attachment.file_name}</p>
                      {attachment.attachment_type === 'url' && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          URL
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Uploaded by {attachment.first_name} {attachment.last_name} • 
                      {attachment.file_size && attachment.file_size > 0 ? ` ${Math.round(attachment.file_size / 1024)}KB` : 'External link'}
                      {attachment.attachment_type === 'url' && attachment.file_url && (
                        <span className="ml-2 text-blue-600 text-xs">
                          {new URL(attachment.file_url).hostname}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={getDownloadUrl(attachment.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {attachment.attachment_type === 'url' ? 'Open' : 'Download'}
                  </a>
                  {isEditing && (currentUser?.role === 'admin' || 
                    currentUser?.role === 'manager' || 
                    attachment.uploaded_by === currentUser?.id) && (
                    <button
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Delete attachment"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Subtasks Section */}
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

