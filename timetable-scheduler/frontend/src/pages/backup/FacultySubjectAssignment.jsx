import { useState, useEffect } from 'react';
import { facultyAPI, subjectAPI } from '../services/api';
import { Link2, Save, Trash2 } from 'lucide-react';

const FacultySubjectAssignment = () => {
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [preferenceLevel, setPreferenceLevel] = useState(1);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchFaculty();
    fetchSubjects();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await facultyAPI.getAll();
      setFaculty(response.data.data || response.data);
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

  const fetchAssignments = async (facultyId) => {
    try {
      const response = await facultyAPI.getSubjects(facultyId);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedFaculty || !selectedSubject) {
      alert('Please select both faculty and subject!');
      return;
    }

    try {
      await facultyAPI.assignSubject(selectedFaculty, selectedSubject, preferenceLevel);
      alert('Assignment successful!');
      fetchAssignments(selectedFaculty);
    } catch (error) {
      alert(error.response?.data?.message || 'Assignment failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Faculty-Subject Assignment</h1>
        <p className="text-gray-600 mt-1">Assign subjects to faculty members</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Assign Subject to Faculty</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Faculty *
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                if (e.target.value) fetchAssignments(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">-- Select Faculty --</option>
              {faculty.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
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
              Preference Level
            </label>
            <select
              value={preferenceLevel}
              onChange={(e) => setPreferenceLevel(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={1}>High (1)</option>
              <option value={2}>Medium (2)</option>
              <option value={3}>Low (3)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleAssign}
          className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
        >
          <Save size={20} />
          <span>Assign Subject</span>
        </button>

        {selectedFaculty && assignments.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Current Assignments:</h3>
            <div className="space-y-2">
              {assignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium">{assignment.name}</span>
                  <span className="text-sm text-gray-600">
                    Preference: Level {assignment.preference_level}
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

export default FacultySubjectAssignment;