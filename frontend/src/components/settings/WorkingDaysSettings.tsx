import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

interface WorkingDayConfig {
  id: number;
  day_of_week: string;
  is_working_day: boolean;
  start_time: string;
  end_time: string;
  notes: string | null;
}

interface HolidayOverride {
  id: number;
  holiday_date: string;
  holiday_name: string;
  description: string | null;
  is_recurring: boolean;
}

const WorkingDaysSettings = () => {
  const [workingDays, setWorkingDays] = useState<WorkingDayConfig[]>([]);
  const [holidays, setHolidays] = useState<HolidayOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    holiday_date: '',
    holiday_name: '',
    description: '',
    is_recurring: false
  });

  const dayNames = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workingDaysRes, holidaysRes] = await Promise.all([
        api.get('/settings/working-days'),
        api.get('/settings/holidays')
      ]);
      setWorkingDays(workingDaysRes.data.configs);
      setHolidays(holidaysRes.data.holidays);
    } catch (error) {
      toast.error('Failed to fetch working days configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingDayChange = async (dayOfWeek: string, field: string, value: any) => {
    try {
      const updatedDays = workingDays.map(day => 
        day.day_of_week === dayOfWeek ? { ...day, [field]: value } : day
      );
      setWorkingDays(updatedDays);
      
      await api.put('/settings/working-days', { configs: updatedDays });
      toast.success('Working days configuration updated');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update working days');
      // Revert on error
      fetchData();
    }
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/settings/holidays', newHoliday);
      toast.success('Holiday added successfully');
      setShowHolidayModal(false);
      setNewHoliday({ holiday_date: '', holiday_name: '', description: '', is_recurring: false });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    
    try {
      await api.delete(`/settings/holidays/${id}`);
      toast.success('Holiday deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete holiday');
    }
  };

  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : '';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <h2 className="text-2xl font-bold text-gray-900">Working Days Configuration</h2>
          <p className="text-gray-600 mt-1">Configure working days and holiday overrides</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Weekly Schedule */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {dayNames.map((day) => {
                const dayConfig = workingDays.find(d => d.day_of_week === day.key);
                if (!dayConfig) return null;

                return (
                  <div key={day.key} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <input
                        type="checkbox"
                        checked={dayConfig.is_working_day}
                        onChange={(e) => handleWorkingDayChange(day.key, 'is_working_day', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="font-medium text-gray-900">{day.label}</span>
                    </div>

                    {dayConfig.is_working_day && (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Start:</label>
                          <input
                            type="time"
                            value={formatTime(dayConfig.start_time)}
                            onChange={(e) => handleWorkingDayChange(day.key, 'start_time', e.target.value + ':00')}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">End:</label>
                          <input
                            type="time"
                            value={formatTime(dayConfig.end_time)}
                            onChange={(e) => handleWorkingDayChange(day.key, 'end_time', e.target.value + ':00')}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex-1">
                      <input
                        type="text"
                        value={dayConfig.notes || ''}
                        onChange={(e) => handleWorkingDayChange(day.key, 'notes', e.target.value)}
                        placeholder="Notes (optional)"
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Holiday Overrides */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Holiday Overrides</h3>
            <button
              onClick={() => setShowHolidayModal(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiPlus size={16} />
              Add Holiday
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            {holidays.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No holidays configured. Add holidays to override working days.
              </div>
            ) : (
              <div className="space-y-3">
                {holidays.map((holiday) => (
                  <div key={holiday.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">{holiday.holiday_name}</h4>
                      <p className="text-sm text-gray-600">{formatDate(holiday.holiday_date)}</p>
                      {holiday.description && (
                        <p className="text-sm text-gray-500 mt-1">{holiday.description}</p>
                      )}
                      {holiday.is_recurring && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                          Recurring
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      title="Delete holiday"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Holiday</h2>

            <form onSubmit={handleCreateHoliday} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Holiday Date *
                </label>
                <input
                  type="date"
                  required
                  value={newHoliday.holiday_date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, holiday_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  required
                  value={newHoliday.holiday_name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, holiday_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., New Year's Day"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newHoliday.description}
                  onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={newHoliday.is_recurring}
                  onChange={(e) => setNewHoliday({ ...newHoliday, is_recurring: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_recurring" className="text-sm text-gray-700">
                  Recurring annually
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowHolidayModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingDaysSettings;
