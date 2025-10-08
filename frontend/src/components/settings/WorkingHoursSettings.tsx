import { useEffect, useState } from 'react';
import { FiSave, FiClock } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

interface WorkingHoursConfig {
  id: number;
  default_start_time: string;
  default_end_time: string;
  lunch_break_minutes: number;
  include_weekends: boolean;
  timezone: any;
}

const WorkingHoursSettings = () => {
  const [config, setConfig] = useState<WorkingHoursConfig>({
    id: 1,
    default_start_time: '09:30:00',
    default_end_time: '18:00:00',
    lunch_break_minutes: 60,
    include_weekends: false,
    timezone: { name: 'UTC', offset: '+00:00' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const timezones = [
    { name: 'UTC', offset: '+00:00' },
    { name: 'EST', offset: '-05:00' },
    { name: 'PST', offset: '-08:00' },
    { name: 'GMT', offset: '+00:00' },
    { name: 'CET', offset: '+01:00' },
    { name: 'JST', offset: '+09:00' },
    { name: 'IST', offset: '+05:30' },
    { name: 'AEST', offset: '+10:00' }
  ];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/working-hours');
      setConfig(response.data.config);
    } catch (error) {
      toast.error('Failed to fetch working hours configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/settings/working-hours', config);
      toast.success('Working hours configuration saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save working hours configuration');
    } finally {
      setSaving(false);
    }
  };

  const calculateWorkingHours = () => {
    const start = new Date(`2000-01-01T${config.default_start_time}`);
    const end = new Date(`2000-01-01T${config.default_end_time}`);
    const lunchBreak = config.lunch_break_minutes * 60000; // Convert to milliseconds
    
    const diff = end.getTime() - start.getTime() - lunchBreak;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const calculateWeeklyHours = () => {
    const dailyHours = calculateWorkingHours();
    const workingDays = config.include_weekends ? 7 : 5;
    
    // Parse daily hours (assuming format like "8h 30m")
    const match = dailyHours.match(/(\d+)h\s*(\d+)?m?/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2] || '0');
      const totalMinutes = (hours * 60 + minutes) * workingDays;
      const weeklyHours = Math.floor(totalMinutes / 60);
      const weeklyMinutes = totalMinutes % 60;
      
      return `${weeklyHours}h ${weeklyMinutes}m`;
    }
    
    return 'N/A';
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
          <h2 className="text-2xl font-bold text-gray-900">Working Hours Configuration</h2>
          <p className="text-gray-600 mt-1">Configure daily working hours and timezone settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSave size={16} />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Daily Time Range */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Time Range</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={config.default_start_time.substring(0, 5)}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    default_start_time: e.target.value + ':00' 
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={config.default_end_time.substring(0, 5)}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    default_end_time: e.target.value + ':00' 
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lunch Break Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="180"
                value={config.lunch_break_minutes}
                onChange={(e) => setConfig({ 
                  ...config, 
                  lunch_break_minutes: parseInt(e.target.value) || 0 
                })}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Weekend Configuration */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekend Configuration</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="include_weekends"
                checked={config.include_weekends}
                onChange={(e) => setConfig({ ...config, include_weekends: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="include_weekends" className="text-sm text-gray-700">
                Include weekends in working days calculation
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              When enabled, weekend days (Saturday and Sunday) will be considered as working days for task effort estimation and SLA tracking.
            </p>
          </div>
        </div>

        {/* Timezone Configuration */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timezone Configuration</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={config.timezone.name}
                onChange={(e) => {
                  const selectedTimezone = timezones.find(tz => tz.name === e.target.value);
                  setConfig({ 
                    ...config, 
                    timezone: selectedTimezone || timezones[0] 
                  });
                }}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {timezones.map((tz) => (
                  <option key={tz.name} value={tz.name}>
                    {tz.name} ({tz.offset})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                This timezone will be used for all time-based calculations and displays.
              </p>
            </div>
          </div>
        </div>

        {/* Auto-calculated Working Hours */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculated Working Hours</h3>
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FiClock className="text-blue-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">Daily Hours</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{calculateWorkingHours()}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FiClock className="text-blue-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">Weekly Hours</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{calculateWeeklyHours()}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FiClock className="text-blue-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">Working Days</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {config.include_weekends ? '7' : '5'}
                </div>
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-4 text-center">
              These calculations are used for task effort estimation and SLA tracking across the system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursSettings;
