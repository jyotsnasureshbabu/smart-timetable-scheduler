import { useState, useEffect } from 'react';
import { batchAPI } from '../services/api';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    year: 1,
    semester: 1,
    student_count: 60,
    department: '',
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await batchAPI.getAll();
      console.log('✅ Fetched batches:', response.data);
      setBatches(response.data.data || response.data);
      setError('');
    } catch (error) {
      console.error('❌ Error fetching batches:', error);
      setError('Failed to load batches: ' + error.message);
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
        console.log('🔄 Updating batch:', editingId);
        await batchAPI.update(editingId, formData);
        alert('Batch updated successfully!');
      } else {
        console.log('➕ Creating new batch');
        await batchAPI.create(formData);
        alert('Batch added successfully!');
      }
      
      await fetchBatches();
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', year: 1, semester: 1, student_count: 60, department: '' });
    } catch (error) {
      console.error('❌ Submit error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save batch';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    
    try {
      await batchAPI.delete(id);
      alert('Batch deleted successfully!');
      fetchBatches();
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div style={{padding:'40px', textAlign:'center'}}>
        <div style={{fontSize:'20px'}}>Loading batches...</div>
      </div>
    );
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
            Batches Management
          </h1>
          <p style={{ color: '#666' }}>Manage student batches and groups</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', year: 1, semester: 1, student_count: 60, department: '' });
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
          ➕ Add Batch
        </button>
      </div>

      {/* BATCHES GRID */}
      {batches.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No batches yet</h3>
          <p style={{ color: '#666' }}>Click "Add Batch" to create your first batch</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {batches.map((batch) => (
            <div key={batch.id} style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#1f2937'
              }}>
                {batch.name}
              </h3>
              <p style={{ color: '#666', marginBottom: '4px' }}>
                🏢 {batch.department || 'No department'}
              </p>
              <p style={{ color: '#666', marginBottom: '4px' }}>
                📅 Year {batch.year}, Semester {batch.semester}
              </p>
              <p style={{ color: '#666', marginBottom: '12px' }}>
                👥 {batch.student_count} students
              </p>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setFormData({
                      name: batch.name,
                      year: batch.year,
                      semester: batch.semester,
                      student_count: batch.student_count,
                      department: batch.department || ''
                    });
                    setEditingId(batch.id);
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
                    fontWeight: '500'
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(batch.id)}
                  style={{
                    flex: 1,
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    padding: '8px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  🗑️ Delete
                </button>
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
              {editingId ? '✏️ Edit Batch' : '➕ Add Batch'}
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
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Batch Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., CSE-A-2024"
                  required
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

              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Department *
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Computer Science"
                  required
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Year *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Semester *
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Student Count *
                </label>
                <input
                  type="number"
                  value={formData.student_count}
                  onChange={(e) => setFormData({ ...formData, student_count: parseInt(e.target.value) || 1 })}
                  placeholder="e.g., 60"
                  min="1"
                  required
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
                    cursor: 'pointer'
                  }}
                >
                  {editingId ? '💾 Update Batch' : '➕ Add Batch'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setError('');
                    setFormData({ name: '', year: 1, semester: 1, student_count: 60, department: '' });
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
                    cursor: 'pointer'
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

export default Batches;