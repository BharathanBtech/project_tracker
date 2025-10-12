import React, { useState, useRef } from 'react';
import { FiUpload, FiFile, FiTrash2, FiFileText, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ProjectDocument {
  id?: string;
  file: File;
  name: string;
  type: string;
  size: number;
  description?: string;
  category: 'requirements' | 'specifications' | 'design' | 'other';
}

interface ProjectDocumentUploadProps {
  documents: ProjectDocument[];
  onChange: (documents: ProjectDocument[]) => void;
}

const ProjectDocumentUpload: React.FC<ProjectDocumentUploadProps> = ({ documents, onChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-rar-compressed'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FiFile className="text-red-600" size={20} />;
    if (type.includes('word') || type.includes('document')) return <FiFileText className="text-blue-600" size={20} />;
    if (type.includes('sheet') || type.includes('excel')) return <FiFile className="text-green-600" size={20} />;
    if (type.includes('image')) return <FiImage className="text-purple-600" size={20} />;
    return <FiFile className="text-gray-600" size={20} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedFileTypes.includes(file.type)) {
      return 'File type not supported. Please upload PDF, Word, Excel, images, or text files.';
    }
    if (file.size > maxFileSize) {
      return 'File size too large. Maximum size is 10MB.';
    }
    return null;
  };

  const handleFiles = (files: FileList) => {
    const newDocuments: ProjectDocument[] = [];
    let hasErrors = false;

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        hasErrors = true;
        return;
      }

      const document: ProjectDocument = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        description: '',
        category: 'requirements'
      };
      newDocuments.push(document);
    });

    if (!hasErrors && newDocuments.length > 0) {
      onChange([...documents, ...newDocuments]);
      toast.success(`${newDocuments.length} file(s) added successfully`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeDocument = (id: string) => {
    onChange(documents.filter(doc => doc.id !== id));
    toast.success('Document removed');
  };

  const updateDocument = (id: string, updates: Partial<ProjectDocument>) => {
    onChange(documents.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <FiUpload size={32} className="text-primary-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Project Documents
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <button
              type="button"
              onClick={openFileDialog}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiUpload size={16} />
              Choose Files
            </button>
          </div>

          <div className="text-sm text-gray-500">
            <p>Supported formats: PDF, Word, Excel, Images, Text files</p>
            <p>Maximum file size: 10MB per file</p>
          </div>
        </div>
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Uploaded Documents ({documents.length})
          </h4>
          
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getFileIcon(doc.type)}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900">{doc.name}</h5>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(doc.size)} • {doc.type}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={doc.category}
                          onChange={(e) => updateDocument(doc.id!, { category: e.target.value as any })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="requirements">Requirements</option>
                          <option value="specifications">Specifications</option>
                          <option value="design">Design Documents</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={doc.description || ''}
                          onChange={(e) => updateDocument(doc.id!, { description: e.target.value })}
                          placeholder="Brief description of this document"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id!)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove document"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {documents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FiFileText size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Document Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>Total files: {documents.length}</p>
                <p>Total size: {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['requirements', 'specifications', 'design', 'other'].map((category) => {
                    const count = documents.filter(doc => doc.category === category).length;
                    return count > 0 ? (
                      <span
                        key={category}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {category}: {count}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDocumentUpload;
