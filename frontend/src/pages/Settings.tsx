import { useState } from 'react';
import { FiSettings, FiCpu, FiCalendar, FiClock, FiShield, FiUpload } from 'react-icons/fi';
import LLMProviderSettings from '../components/settings/LLMProviderSettings';
import WorkingDaysSettings from '../components/settings/WorkingDaysSettings';
import WorkingHoursSettings from '../components/settings/WorkingHoursSettings';
import RolePermissionsSettings from '../components/settings/RolePermissionsSettings';
import AttachmentSettings from '../components/settings/AttachmentSettings';

type SettingsTab = 'llm-providers' | 'working-days' | 'working-hours' | 'role-permissions' | 'attachment-settings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('llm-providers');

  const settingsTabs = [
    {
      id: 'llm-providers' as SettingsTab,
      name: 'AI Provider Configuration',
      icon: FiCpu,
      description: 'Configure AI providers and models'
    },
    {
      id: 'working-days' as SettingsTab,
      name: 'Working Days Calendar',
      icon: FiCalendar,
      description: 'Set working days and holidays'
    },
    {
      id: 'working-hours' as SettingsTab,
      name: 'Working Hours Schedule',
      icon: FiClock,
      description: 'Configure daily working hours'
    },
        {
          id: 'role-permissions' as SettingsTab,
          name: 'Role & Permission Management',
          icon: FiShield,
          description: 'Manage role-based access control'
        },
        {
          id: 'attachment-settings' as SettingsTab,
          name: 'Attachment Configuration',
          icon: FiUpload,
          description: 'Configure file upload limits and attachment settings'
        }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'llm-providers':
        return <LLMProviderSettings />;
      case 'working-days':
        return <WorkingDaysSettings />;
      case 'working-hours':
        return <WorkingHoursSettings />;
      case 'role-permissions':
        return <RolePermissionsSettings />;
      case 'attachment-settings':
        return <AttachmentSettings />;
      default:
        return <LLMProviderSettings />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FiSettings className="text-primary-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure system settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Categories</h3>
            <nav className="space-y-2">
              {settingsTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
