import { useState, useEffect } from 'react';
import { subjectAPI } from '../services/api';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hours_per_week: 4,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectAPI.getAll();
      console.log('✅ Fetched subjects:', response.data);
      setSubjects(response.data.data || response.data);
      setError('');
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
      setError('Failed to load subjects: ' + error.message);
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
        console.log('🔄 Updating subject:', editingId);
        const response = await subjectAPI.update(editingId, formData);
        console.log('✅ Update response:', response.data);
        alert('Subject updated successfully!');
      } else {
        console.log('➕ Creating new subject');
        const response = await subjectAPI.create(formData);
        console.log('✅ Create response:', response.data);
        alert('Subject added successfully!');
      }
      
      await fetchSubjects(); // Reload the list
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', code: '', hours_per_week: 4 });
    } catch (error) {
      console.error('❌ Submit error:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save subject';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await subjectAPI.delete(id);
      alert('Subject deleted successfully!');
      fetchSubjects();
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div style={{padding:'40px', textAlign:'center'}}>
        <div style={{fontSize:'20px'}}>Loading subjects...</div>
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
            Subjects Management
          </h1>
          <p style={{ color: '#666' }}>Manage subjects and their weekly hours</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', code: '', hours_per_week: 4 });
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
          ➕ Add Subject
        </button>
      </div>

      {/* SUBJECTS GRID */}
      {subjects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No subjects yet</h3>
          <p style={{ color: '#666' }}>Click "Add Subject" to create your first subject</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {subjects.map((subject) => (
            <div key={subject.id} style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#1f2937'
              }}>
                {subject.name}
              </h3>
              <p style={{ color: '#666', marginBottom: '8px' }}>
                Code: <strong>{subject.code}</strong>
              </p>
              <p style={{ 
                backgroundColor: '#dbeafe', 
                color: '#1e40af', 
                padding: '4px 12px', 
                borderRadius: '20px',
                display: 'inline-block',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {subject.hours_per_week} hours/week
              </p>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setFormData({
                      name: subject.name,
                      code: subject.code,
                      hours_per_week: subject.hours_per_week
                    });
                    setEditingId(subject.id);
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
                  onClick={() => handleDelete(subject.id)}
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
              {editingId ? '✏️ Edit Subject' : '➕ Add Subject'}
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
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mathematics"
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
                  Subject Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., MATH101"
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Hours per Week *
                </label>
                <input
                  type="number"
                  value={formData.hours_per_week}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    hours_per_week: parseInt(e.target.value) || 1
                  })}
                  min="1"
                  max="20"
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
                  {editingId ? '💾 Update Subject' : '➕ Add Subject'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setError('');
                    setFormData({ name: '', code: '', hours_per_week: 4 });
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

export default Subjects;