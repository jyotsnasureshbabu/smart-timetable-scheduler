import { useState, useEffect } from 'react';
import { timeSlotAPI } from '../services/api';

const TimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
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
      setLoading(true);
      const response = await timeSlotAPI.getAll();
      console.log('✅ Fetched time slots:', response.data);
      setTimeSlots(response.data.data || response.data);
      setError('');
    } catch (error) {
      console.error('❌ Error fetching time slots:', error);
      setError('Failed to load time slots: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('📤 Submitting data:', formData);
    
    try {
      if (editingId) {
        await timeSlotAPI.update(editingId, formData);
        alert('Time slot updated successfully!');
      } else {
        await timeSlotAPI.create(formData);
        alert('Time slot added successfully!');
      }
      await fetchTimeSlots();
      setShowModal(false);
      setEditingId(null);
      setFormData({ day_of_week: 1, start_time: '09:00', end_time: '09:50', period_name: '', is_break: false });
    } catch (error) {
      console.error('❌ Submit error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save time slot';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    try {
      await timeSlotAPI.delete(id);
      alert('Time slot deleted successfully!');
      fetchTimeSlots();
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete: ' + (error.response?.data?.message || error.message));
    }
  };

  // Group time slots by day
  const groupedSlots = timeSlots.reduce((acc, slot) => {
    const dayName = slot.day_name || daysOfWeek.find(d => d.value === slot.day_of_week)?.label || 'Unknown';
    if (!acc[dayName]) acc[dayName] = [];
    acc[dayName].push(slot);
    return acc;
  }, {});

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: '20px' }}>Loading time slots...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* ERROR BANNER */}
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c00',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>Time Slots Management</h1>
          <p style={{ color: '#666' }}>Configure class periods and break times</p>
        </div>
        <button
          onClick={() => {
            setFormData({ day_of_week: 1, start_time: '09:00', end_time: '09:50', period_name: '', is_break: false });
            setEditingId(null);
            setError('');
            setShowModal(true);
          }}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ➕ Add Time Slot
        </button>
      </div>

      {/* TIME SLOTS GROUPED BY DAY */}
      {Object.keys(groupedSlots).length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No time slots yet</h3>
          <p style={{ color: '#666' }}>Click "Add Time Slot" to create your first time slot</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {Object.entries(groupedSlots).map(([day, slots]) => (
            <div key={day} style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '15px',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📅</span> {day}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {slots.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((slot) => (
                  <div
                    key={slot.id}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: slot.is_break ? '#fef3c7' : '#dbeafe',
                      border: `1px solid ${slot.is_break ? '#fbbf24' : '#93c5fd'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '600',
                        color: slot.is_break ? '#92400e' : '#1e40af',
                        marginBottom: '4px'
                      }}>
                        {slot.start_time} - {slot.end_time}
                      </div>
                      {slot.period_name && (
                        <div style={{
                          fontSize: '13px',
                          color: slot.is_break ? '#78350f' : '#1e3a8a'
                        }}>
                          {slot.period_name}
                        </div>
                      )}
                      {slot.is_break && (
                        <div style={{
                          fontSize: '11px',
                          color: '#92400e',
                          fontWeight: '500',
                          marginTop: '2px'
                        }}>
                          ☕ Break Time
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setFormData({
                            day_of_week: slot.day_of_week,
                            start_time: slot.start_time,
                            end_time: slot.end_time,
                            period_name: slot.period_name || '',
                            is_break: slot.is_break
                          });
                          setEditingId(slot.id);
                          setError('');
                          setShowModal(true);
                        }}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: '#2563eb',
                          padding: '6px 10px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: '#dc2626',
                          padding: '6px 10px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              {editingId ? '✏️ Edit Time Slot' : '➕ Add Time Slot'}
            </h2>

            {error && (
              <div style={{
                backgroundColor: '#fee',
                color: '#c00',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Day, Start, End fields (already done) */}
              {/* PERIOD NAME */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Period Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={formData.period_name}
                  onChange={(e) => setFormData({ ...formData, period_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* IS BREAK CHECKBOX */}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={formData.is_break}
                  onChange={(e) => setFormData({ ...formData, is_break: e.target.checked })}
                />
                <label style={{ color: '#374151', fontWeight: '500' }}>Mark as Break Time</label>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); }}
                  style={{
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {editingId ? 'Update' : 'Save'}
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
