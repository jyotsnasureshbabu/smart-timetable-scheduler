import { useState, useEffect } from 'react';
import { batchAPI, subjectAPI } from '../services/api';
import { Save } from 'lucide-react';

const BatchSubjectAssignment = () => {
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(4);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchBatches();
    fetchSubjects();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await batchAPI.getAll();
      setBatches(response.data.data || response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll();
      setSubjects(response.data.data || response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAssignments = async (batchId) => {
    try {
      const response = await batchAPI.getSubjects(batchId);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedBatch || !selectedSubject) {
      alert('Please select both batch and subject!');
      return;
    }

    try {
      await batchAPI.assignSubject(selectedBatch, selectedSubject, hoursPerWeek);
      alert('Assignment successful!');
      fetchAssignments(selectedBatch);
    } catch (error) {
      alert(error.response?.data?.message || 'Assignment failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Batch-Subject Assignment</h1>
        <p className="text-gray-600 mt-1">Assign subjects to batches</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Assign Subject to Batch</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Batch *
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                if (e.target.value) fetchAssignments(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">-- Select Batch --</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subject *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours per Week
            </label>
            <input
              type="number"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
              max="10"
            />
          </div>
        </div>

        <button
          onClick={handleAssign}
          className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
        >
          <Save size={20} />
          <span>Assign Subject</span>
        </button>

        {selectedBatch && assignments.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Current Assignments:</h3>
            <div className="space-y-2">
              {assignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium">{assignment.name}</span>
                  <span className="text-sm text-gray-600">
                    {assignment.hours_per_week} hours/week
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchSubjectAssignment;