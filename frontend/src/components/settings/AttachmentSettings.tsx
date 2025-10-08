import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiSave, FiRefreshCw, FiUpload, FiLink, FiShield } from 'react-icons/fi';

interface AttachmentConfig {
  id: number;
  config_key: string;
  config_value: any;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AttachmentSettings = () => {
  const [configs, setConfigs] = useState<AttachmentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/attachment-config');
      setConfigs(response.data.configs);
    } catch (error) {
      toast.error('Failed to fetch attachment configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/settings/attachment-config', { configs });
      toast.success('Attachment configuration updated successfully');
    } catch (error) {
      toast.error('Failed to update attachment configuration');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (configKey: string, value: any) => {
    setConfigs(prev => prev.map(config => 
      config.config_key === configKey 
        ? { ...config, config_value: value }
        : config
    ));
  };

  const getMaxFileSizeConfig = () => {
    return configs.find(c => c.config_key === 'max_file_size')?.config_value || { value: 5242880, unit: 'MB', display_value: 5 };
  };

  const getUrlConfig = () => {
    return configs.find(c => c.config_key === 'enable_url_attachments')?.config_value || { enabled: true, allowed_domains: ['*'], require_https: false };
  };

  const getAllowedTypes = () => {
    return configs.find(c => c.config_key === 'allowed_file_types')?.config_value || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const maxFileSize = getMaxFileSizeConfig();
  const urlConfig = getUrlConfig();
  const allowedTypes = getAllowedTypes();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiUpload size={24} />
            Attachment Configuration
          </h2>
          <p className="text-gray-600 mt-1">Configure file upload limits and attachment settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <FiRefreshCw className="animate-spin" size={16} />
          ) : (
            <FiSave size={16} />
          )}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiUpload className="text-primary-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">File Upload Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum File Size (MB)
              </label>
              <input
                type="number"
                value={maxFileSize.display_value}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  if (newValue > 0) {
                    updateConfig('max_file_size', {
                      value: newValue * 1024 * 1024,
                      unit: 'MB',
                      display_value: newValue
                    });
                  }
                }}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current limit: {maxFileSize.display_value}MB ({maxFileSize.value} bytes)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed File Types
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {allowedTypes.map((type: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {type}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                File types are configured server-side for security
              </p>
            </div>
          </div>
        </div>

        {/* URL Attachment Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiLink className="text-primary-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">URL Attachment Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enable URL Attachments
                </label>
                <p className="text-xs text-gray-500">Allow users to attach external links</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={urlConfig.enabled}
                  onChange={(e) => {
                    updateConfig('enable_url_attachments', {
                      ...urlConfig,
                      enabled: e.target.checked
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {urlConfig.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Require HTTPS
                    </label>
                    <p className="text-xs text-gray-500">Only allow secure HTTPS URLs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={urlConfig.require_https}
                      onChange={(e) => {
                        updateConfig('enable_url_attachments', {
                          ...urlConfig,
                          require_https: e.target.checked
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Domains
                  </label>
                  <div className="space-y-2">
                    {urlConfig.allowed_domains.map((domain: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {domain === '*' ? 'All domains' : domain}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently allowing all domains (*)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiShield className="text-blue-600 mt-0.5" size={16} />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Security Notice</h4>
            <p className="text-sm text-blue-700 mt-1">
              File type restrictions and security validations are enforced server-side. 
              Changes to these settings may require server restart to take effect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentSettings;
