import { useState, useEffect } from 'react';
import { batchAPI, subjectAPI } from '../services/api';

const BatchSubjectAssignment = () => {
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(4);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBatches();
    fetchSubjects();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await batchAPI.getAll();
      console.log('✅ Fetched batches:', response.data);
      setBatches(response.data.data || response.data);
    } catch (error) {
      console.error('❌ Error fetching batches:', error);
      setError('Failed to load batches');
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

  const fetchAssignments = async (batchId) => {
    try {
      const response = await batchAPI.getSubjects(batchId);
      console.log('✅ Fetched assignments:', response.data);
      setAssignments(response.data);
    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedBatch || !selectedSubject) {
      alert('Please select both batch and subject!');
      return;
    }

    setLoading(true);
    setError('');
    console.log('📤 Assigning:', { batchId: selectedBatch, subjectId: selectedSubject, hoursPerWeek });

    try {
      await batchAPI.assignSubject(selectedBatch, selectedSubject, hoursPerWeek);
      setMessage('✅ Subject assigned to batch successfully!');
      fetchAssignments(selectedBatch);
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
          Batch-Subject Assignment
        </h1>
        <p style={{ color: '#666' }}>Define which subjects each batch needs to study</p>
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
          {/* SELECT BATCH */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Select Batch *
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
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
              <option value="">-- Select Batch --</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} - {b.department}
                </option>
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

          {/* HOURS PER WEEK */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Hours per Week *
            </label>
            <input
              type="number"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(parseInt(e.target.value) || 1)}
              min="1"
              max="10"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* ASSIGN BUTTON */}
        <button
          onClick={handleAssign}
          disabled={loading || !selectedBatch || !selectedSubject}
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
            opacity: (loading || !selectedBatch || !selectedSubject) ? 0.5 : 1
          }}
        >
          <span style={{ fontSize: '20px' }}>💾</span>
          <span>{loading ? 'Assigning...' : 'Assign Subject to Batch'}</span>
        </button>

        {/* CURRENT CURRICULUM */}
        {selectedBatch && assignments.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              color: '#1f2937'
            }}>
              Current Curriculum for Selected Batch
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {assignments.map((assignment, index) => (
                <div key={index} style={{
                  backgroundColor: '#faf5ff',
                  border: '2px solid #d8b4fe',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h4 style={{ 
                    fontWeight: 'bold', 
                    color: '#6b21a8', 
                    marginBottom: '8px',
                    fontSize: '16px'
                  }}>
                    {assignment.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#581c87', marginBottom: '4px' }}>
                    📚 Code: <strong>{assignment.code}</strong>
                  </p>
                  <p style={{ fontSize: '14px', color: '#2563eb', fontWeight: '600' }}>
                    ⏰ {assignment.hours_per_week} hours/week
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedBatch && assignments.length === 0 && (
          <div style={{
            marginTop: '32px',
            padding: '24px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            <p style={{ fontSize: '16px' }}>
              📋 No subjects assigned to this batch yet. Create curriculum above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchSubjectAssignment;