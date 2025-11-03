import { useState, useEffect } from 'react';
import { facultyAPI, subjectAPI } from '../services/api';

const FacultySubjectAssignment = () => {
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [preferenceLevel, setPreferenceLevel] = useState(1);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFaculty();
    fetchSubjects();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await facultyAPI.getAll();
      console.log('✅ Fetched faculty:', response.data);
      setFaculty(response.data.data || response.data);
    } catch (error) {
      console.error('❌ Error fetching faculty:', error);
      setError('Failed to load faculty');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll();
      console.log('✅ Fetched subjects:', response.data);
      setSubjects(response.data.data || response.data);
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
      setError('Failed to load subjects');
    }
  };

  const fetchAssignments = async (facultyId) => {
    try {
      const response = await facultyAPI.getSubjects(facultyId);
      console.log('✅ Fetched assignments:', response.data);
      setAssignments(response.data);
    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedFaculty || !selectedSubject) {
      alert('Please select both faculty and subject!');
      return;
    }

    setLoading(true);
    setError('');
    console.log('📤 Assigning:', { facultyId: selectedFaculty, subjectId: selectedSubject, preferenceLevel });

    try {
      await facultyAPI.assignSubject(selectedFaculty, selectedSubject, preferenceLevel);
      setMessage('✅ Subject assigned successfully!');
      fetchAssignments(selectedFaculty);
      setSelectedSubject('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Assignment error:', error);
      const errorMsg = error.response?.data?.message || 'Assignment failed';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px', color: '#1f2937' }}>
          Faculty-Subject Assignment
        </h1>
        <p style={{ color: '#666' }}>Assign subjects that faculty members can teach</p>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '2px solid #10b981',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>✅</span>
          <span style={{ color: '#065f46', fontWeight: '600' }}>{message}</span>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '2px solid #fcc',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          color: '#c00'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ASSIGNMENT FORM */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
          Create New Assignment
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* SELECT FACULTY */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Select Faculty *
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                if (e.target.value) fetchAssignments(e.target.value);
                setMessage('');
                setError('');
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="">-- Select Faculty --</option>
              {faculty.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* SELECT SUBJECT */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Select Subject *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* PREFERENCE LEVEL */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Preference Level
            </label>
            <select
              value={preferenceLevel}
              onChange={(e) => setPreferenceLevel(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value={1}>High (1)</option>
              <option value={2}>Medium (2)</option>
              <option value={3}>Low (3)</option>
            </select>
          </div>
        </div>

        {/* ASSIGN BUTTON */}
        <button
          onClick={handleAssign}
          disabled={loading || !selectedFaculty || !selectedSubject}
          style={{
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: (loading || !selectedFaculty || !selectedSubject) ? 0.5 : 1
          }}
        >
          <span style={{ fontSize: '20px' }}>💾</span>
          <span>{loading ? 'Assigning...' : 'Assign Subject'}</span>
        </button>

        {/* CURRENT ASSIGNMENTS */}
        {selectedFaculty && assignments.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              color: '#1f2937'
            }}>
              Current Assignments for Selected Faculty
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {assignments.map((assignment, index) => (
                <div key={index} style={{
                  backgroundColor: '#dbeafe',
                  border: '2px solid #93c5fd',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h4 style={{ 
                    fontWeight: 'bold', 
                    color: '#1e40af', 
                    marginBottom: '8px',
                    fontSize: '16px'
                  }}>
                    {assignment.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#1e3a8a', marginBottom: '4px' }}>
                    📚 Code: <strong>{assignment.code}</strong>
                  </p>
                  <p style={{ fontSize: '14px', color: '#1e3a8a' }}>
                    ⭐ Preference: <strong>Level {assignment.preference_level}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFaculty && assignments.length === 0 && (
          <div style={{
            marginTop: '32px',
            padding: '24px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            <p style={{ fontSize: '16px' }}>
              📋 No subjects assigned to this faculty yet. Assign one above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultySubjectAssignment;