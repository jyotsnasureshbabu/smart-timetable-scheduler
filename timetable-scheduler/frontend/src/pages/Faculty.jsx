import { useState, useEffect } from 'react';
import { facultyAPI } from '../services/api';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const response = await facultyAPI.getAll();
      console.log('✅ Fetched faculty:', response.data);
      setFaculty(response.data.data || response.data);
      setError('');
    } catch (error) {
      console.error('❌ Error fetching faculty:', error);
      setError('Failed to load faculty: ' + error.message);
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
        console.log('🔄 Updating faculty:', editingId);
        await facultyAPI.update(editingId, formData);
        alert('Faculty updated successfully!');
      } else {
        console.log('➕ Creating new faculty');
        await facultyAPI.create(formData);
        alert('Faculty added successfully!');
      }
      
      await fetchFaculty();
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', subject: '', email: '', phone: '' });
    } catch (error) {
      console.error('❌ Submit error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save faculty';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    
    try {
      await facultyAPI.delete(id);
      alert('Faculty deleted successfully!');
      fetchFaculty();
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div style={{padding:'40px', textAlign:'center'}}>
        <div style={{fontSize:'20px'}}>Loading faculty...</div>
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
            Faculty Management
          </h1>
          <p style={{ color: '#666' }}>Manage faculty members and their subjects</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', subject: '', email: '', phone: '' });
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
          ➕ Add Faculty
        </button>
      </div>

      {/* FACULTY GRID */}
      {faculty.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🏫</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No faculty members yet</h3>
          <p style={{ color: '#666' }}>Click "Add Faculty" to create your first faculty member</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {faculty.map((member) => (
            <div key={member.id} style={{
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
                {member.name}
              </h3>
              <p style={{ color: '#666', marginBottom: '4px' }}>
                📚 {member.subject}
              </p>
              <p style={{ color: '#666', marginBottom: '4px' }}>
                ✉️ {member.email || 'No email'}
              </p>
              <p style={{ color: '#666', marginBottom: '12px' }}>
                📞 {member.phone || 'No phone'}
              </p>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setFormData({
                      name: member.name,
                      subject: member.subject,
                      email: member.email || '',
                      phone: member.phone || ''
                    });
                    setEditingId(member.id);
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
                  onClick={() => handleDelete(member.id)}
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
              {editingId ? '✏️ Edit Faculty' : '➕ Add Faculty'}
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
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Dr. John Smith"
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
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., john.smith@college.edu"
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
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +1234567890"
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
                  {editingId ? '💾 Update Faculty' : '➕ Add Faculty'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setError('');
                    setFormData({ name: '', subject: '', email: '', phone: '' });
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

export default Faculty;