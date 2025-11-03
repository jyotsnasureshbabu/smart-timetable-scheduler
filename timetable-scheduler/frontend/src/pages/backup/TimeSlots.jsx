import { useState, useEffect } from 'react';
import { timeSlotAPI } from '../services/api';
import { Plus, Edit, Trash2, Clock, X } from 'lucide-react';

const TimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '09:50',
    period_name: '',
    is_break: false,
  });

  const daysOfWeek = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' },
  ];

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const response = await timeSlotAPI.getAll();
      setTimeSlots(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await timeSlotAPI.update(editingId, formData);
      } else {
        await timeSlotAPI.create(formData);
      }
      fetchTimeSlots();
      closeModal();
    } catch (error) {
      console.error('Error saving time slot:', error);
      alert(error.response?.data?.message || 'Failed to save time slot');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      period_name: item.period_name || '',
      is_break: item.is_break,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    
    try {
      await timeSlotAPI.delete(id);
      fetchTimeSlots();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      alert('Failed to delete time slot');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ day_of_week: 1, start_time: '09:00', end_time: '09:50', period_name: '', is_break: false });
  };

  // Group time slots by day
  const groupedSlots = timeSlots.reduce((acc, slot) => {
    const dayName = slot.day_name || daysOfWeek.find(d => d.value === slot.day_of_week)?.label || 'Unknown';
    if (!acc[dayName]) acc[dayName] = [];
    acc[dayName].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Time Slots Management</h1>
          <p className="text-gray-600 mt-1">Configure class periods and break times</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Time Slot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(groupedSlots).map(([day, slots]) => (
          <div key={day} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="mr-2 text-primary-600" size={20} />
              {day}
            </h3>
            <div className="space-y-2">
              {slots.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    slot.is_break ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">
                        {slot.start_time} - {slot.end_time}
                      </span>
                      {slot.period_name && (
                        <span className="text-sm text-gray-600">({slot.period_name})</span>
                      )}
                    </div>
                    {slot.is_break && (
                      <span className="text-xs text-orange-600 font-medium">Break Time</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(slot)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Time Slot' : 'Add Time Slot'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week *</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period Name</label>
                <input
                  type="text"
                  value={formData.period_name}
                  onChange={(e) => setFormData({ ...formData, period_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g., Period 1"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_break"
                  checked={formData.is_break}
                  onChange={(e) => setFormData({ ...formData, is_break: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_break" className="ml-2 text-sm text-gray-700">
                  This is a break time
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} Time Slot
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlots;