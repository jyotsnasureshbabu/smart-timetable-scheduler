import { useState, useEffect } from 'react';
import { classroomAPI } from '../services/api';

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    capacity: 60,
    type: 'regular',
    building: '',
    floor: 1,
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await classroomAPI.getAll();
      console.log('✅ Fetched classrooms:', response.data);
      setClassrooms(response.data.data || response.data);
      setError('');
    } catch (error) {
      console.error('❌ Error fetching classrooms:', error);
      setError('Failed to load classrooms: ' + error.message);
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
        console.log('🔄 Updating classroom:', editingId);
        await classroomAPI.update(editingId, formData);
        alert('Classroom updated successfully!');
      } else {
        console.log('➕ Creating new classroom');
        await classroomAPI.create(formData);
        alert('Classroom added successfully!');
      }

      await fetchClassrooms();
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', capacity: 60, type: 'regular', building: '', floor: 1 });
    } catch (error) {
      console.error('❌ Submit error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save classroom';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this classroom?')) return;

    try {
      await classroomAPI.delete(id);
      alert('Classroom deleted successfully!');
      fetchClassrooms();
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete: ' + (error.response?.data?.message || error.message));
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'lab':
        return { bg: '#ede9fe', color: '#7c3aed' };
      case 'auditorium':
        return { bg: '#fed7aa', color: '#ea580c' };
      default:
        return { bg: '#dbeafe', color: '#2563eb' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '20px' }}>Loading classrooms...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* ERROR BANNER */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #fcc',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
            Classrooms Management
          </h1>
          <p style={{ color: '#666' }}>Manage classrooms, labs, and auditoriums</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', capacity: 60, type: 'regular', building: '', floor: 1 });
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
          ➕ Add Classroom
        </button>
      </div>

      {/* CLASSROOMS GRID */}
      {classrooms.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏫</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No classrooms yet</h3>
          <p style={{ color: '#666' }}>Click "Add Classroom" to create your first classroom</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {classrooms.map((room) => {
            const typeStyle = getTypeColor(room.type);
            return (
              <div
                key={room.id}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1f2937',
                  }}
                >
                  {room.name}
                </h3>
                <p style={{ color: '#666', marginBottom: '4px' }}>
                  🏢 {room.building || 'No building'} - Floor {room.floor || 'N/A'}
                </p>
                <p style={{ color: '#666', marginBottom: '8px' }}>
                  👥 Capacity: {room.capacity} students
                </p>
                <span
                  style={{
                    backgroundColor: typeStyle.bg,
                    color: typeStyle.color,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    display: 'inline-block',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  {room.type}
                </span>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setFormData({
                        name: room.name,
                        capacity: room.capacity,
                        type: room.type,
                        building: room.building || '',
                        floor: room.floor || 1,
                      });
                      setEditingId(room.id);
                      setError('');
                      setShowModal(true);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      padding: '8px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    style={{
                      flex: 1,
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      padding: '8px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              {editingId ? '✏️ Edit Classroom' : '➕ Add Classroom'}
            </h2>

            {error && (
              <div
                style={{
                  backgroundColor: '#fee',
                  color: '#c00',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '14px',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* FORM FIELDS */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Classroom Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Room A101"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Capacity *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
                  }
                  min="1"
                  required
                  placeholder="e.g., 60"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                  }}
                >
                  <option value="regular">Regular</option>
                  <option value="lab">Lab</option>
                  <option value="auditorium">Auditorium</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Building
                </label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  placeholder="e.g., Main Building"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Floor *
                </label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                  min="0"
                  required
                  placeholder="e.g., 1"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {editingId ? '💾 Update Classroom' : '➕ Add Classroom'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setError('');
                    setFormData({ name: '', capacity: 60, type: 'regular', building: '', floor: 1 });
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
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

export default Classrooms;
