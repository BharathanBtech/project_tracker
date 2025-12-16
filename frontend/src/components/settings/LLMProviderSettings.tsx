import { useEffect, useState } from 'react';
import { FiPlus, FiEdit3, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

interface LLMProvider {
  id: number;
  name: string;
  display_name: string;
  description: string;
  config_schema: any;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface LLMProviderConfig {
  id: number;
  provider_id: number;
  config_key: string;
  config_value: string;
  is_encrypted: boolean;
}

const LLMProviderSettings = () => {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [providerConfigs, setProviderConfigs] = useState<{ [key: number]: LLMProviderConfig[] }>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<{ [key: number]: boolean }>({});

  const [newProvider, setNewProvider] = useState({
    name: '',
    display_name: '',
    description: '',
    config_schema: {}
  });

  const [configValues, setConfigValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/llm-providers');
      setProviders(response.data.providers);
      
      // Fetch configs for each provider
      for (const provider of response.data.providers) {
        await fetchProviderConfigs(provider.id);
      }
    } catch (error) {
      toast.error('Failed to fetch LLM providers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderConfigs = async (providerId: number) => {
    try {
      const response = await api.get(`/settings/llm-providers/${providerId}/configs`);
      setProviderConfigs(prev => ({
        ...prev,
        [providerId]: response.data.configs
      }));
    } catch (error) {
      console.error('Failed to fetch provider configs:', error);
    }
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/settings/llm-providers', newProvider);
      toast.success('LLM provider created successfully');
      setShowCreateModal(false);
      setNewProvider({ name: '', display_name: '', description: '', config_schema: {} });
      fetchProviders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create LLM provider');
    }
  };

  const handleToggleProviderStatus = async (provider: LLMProvider) => {
    try {
      await api.patch(`/settings/llm-providers/${provider.id}/status`, {
        is_active: !provider.is_active
      });
      toast.success(`Provider ${!provider.is_active ? 'activated' : 'deactivated'} successfully`);
      fetchProviders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update provider status');
    }
  };

  const handleOpenConfigModal = (provider: LLMProvider) => {
    setSelectedProvider(provider);
    const configs = providerConfigs[provider.id] || [];
    const initialValues: { [key: string]: string } = {};
    configs.forEach(config => {
      initialValues[config.config_key] = config.config_value;
    });
    setConfigValues(initialValues);
    setShowConfigModal(true);
  };

  const handleSaveConfigs = async () => {
    if (!selectedProvider) return;

    try {
      const configs = Object.entries(configValues).map(([key, value]) => ({
        config_key: key,
        config_value: value,
        is_encrypted: key.includes('key') || key.includes('token')
      }));

      await api.put(`/settings/llm-providers/${selectedProvider.id}/configs`, { configs });
      toast.success('Provider configurations saved successfully');
      setShowConfigModal(false);
      setSelectedProvider(null);
      setConfigValues({});
      fetchProviderConfigs(selectedProvider.id);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save configurations');
    }
  };

  const toggleApiKeyVisibility = (providerId: number) => {
    setShowApiKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
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
          <h2 className="text-2xl font-bold text-gray-900">LLM Providers</h2>
          <p className="text-gray-600 mt-1">Configure AI providers and their settings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiPlus size={20} />
          Add Provider
        </button>
      </div>

      {/* Providers List */}
      <div className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{provider.display_name}</h3>
                    {provider.is_default && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {provider.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleToggleProviderStatus(provider)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        provider.is_active ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          provider.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{provider.description}</p>
                
                {/* Provider Configurations */}
                <div className="space-y-2">
                  {providerConfigs[provider.id]?.map((config) => (
                    <div key={config.id} className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700 capitalize">
                        {config.config_key.replace('_', ' ')}:
                      </span>
                      <span className="text-gray-600">
                        {config.config_key.includes('key') || config.config_key.includes('token') ? (
                          <div className="flex items-center gap-2">
                            <span>
                              {showApiKeys[provider.id] ? config.config_value : maskApiKey(config.config_value)}
                            </span>
                            <button
                              onClick={() => toggleApiKeyVisibility(provider.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showApiKeys[provider.id] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                          </div>
                        ) : (
                          config.config_value
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenConfigModal(provider)}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Configure"
                >
                  <FiEdit3 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Provider Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add LLM Provider</h2>

            <form onSubmit={handleCreateProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., openai, gemini"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProvider.display_name}
                  onChange={(e) => setNewProvider({ ...newProvider, display_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., OpenAI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newProvider.description}
                  onChange={(e) => setNewProvider({ ...newProvider, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Provider description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Provider Modal */}
      {showConfigModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Configure {selectedProvider.display_name}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key *
                </label>
                <input
                  type="password"
                  value={configValues.api_key || ''}
                  onChange={(e) => setConfigValues({ ...configValues, api_key: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  value={configValues.model_name || ''}
                  onChange={(e) => setConfigValues({ ...configValues, model_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., gpt-4, gemini-pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature
                </label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={configValues.temperature || '0.7'}
                  onChange={(e) => setConfigValues({ ...configValues, temperature: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="1"
                  max="4096"
                  value={configValues.max_tokens || '2048'}
                  onChange={(e) => setConfigValues({ ...configValues, max_tokens: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfigs}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMProviderSettings;
