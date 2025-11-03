import { useState, useEffect } from 'react';
import { batchAPI, autoScheduleAPI, timetableAPI } from '../services/api';
import { Calendar, Zap, BarChart3, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const TimetableGenerator = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [academicYear, setAcademicYear] = useState(2024);
  const [semester, setSemester] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await batchAPI.getAll();
      setBatches(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedBatch) {
      alert('Please select a batch first!');
      return;
    }

    setLoading(true);
    try {
      const response = await autoScheduleAPI.generate(selectedBatch, {
        academic_year: academicYear,
        semester: semester
      });

      setGeneratedSchedule(response.data);
      await fetchTimetable();
    } catch (error) {
      console.error('Error generating timetable:', error);
      alert(error.response?.data?.message || 'Failed to generate timetable');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedBatch) return;

    try {
      const response = await timetableAPI.getAll({
        batch_id: selectedBatch,
        academic_year: academicYear,
        semester: semester
      });
      setTimetable(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };

  // Group timetable by day
  const groupedTimetable = timetable.reduce((acc, entry) => {
    const day = entry.day_name || 'Unknown';
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {});

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Calendar className="mr-3" size={36} />
          Automatic Timetable Generator
        </h1>
        <p className="text-blue-100 text-lg">
          Generate optimized timetables with intelligent scheduling algorithm
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Batch *
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setGeneratedSchedule(null);
                setTimetable([]);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">-- Select a Batch --</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} - {batch.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <input
              type="number"
              value={academicYear}
              onChange={(e) => setAcademicYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              min="2020"
              max="2030"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedBatch}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Zap size={20} />
                <span>Generate Timetable</span>
              </>
            )}
          </button>

          {selectedBatch && timetable.length > 0 && (
            <button
              onClick={fetchTimetable}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <BarChart3 size={20} />
              <span>View Existing Timetable</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {generatedSchedule && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <CheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                {generatedSchedule.message}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-800">{generatedSchedule.entries}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {generatedSchedule.statistics?.completionRate || 0}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-600">Subjects Scheduled</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {generatedSchedule.statistics?.subjectsScheduled || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-600">Faculty Utilized</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {generatedSchedule.statistics?.facultyUtilized || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Display */}
      {timetable.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Generated Timetable</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                List View
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="space-y-6">
              {daysOrder.map(day => {
                const daySchedule = groupedTimetable[day];
                if (!daySchedule) return null;

                return (
                  <div key={day} className="border rounded-lg overflow-hidden">
                    <div className="bg-primary-600 text-white px-4 py-3">
                      <h3 className="font-semibold text-lg">{day}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {daySchedule
                        .sort((a, b) => a.start_time?.localeCompare(b.start_time))
                        .map((entry, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-primary-600">
                                {entry.start_time} - {entry.end_time}
                              </span>
                              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                                {entry.period_name}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-1">
                              {entry.subject_name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">
                              👨‍🏫 {entry.faculty_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              🏫 {entry.classroom_name}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classroom</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timetable
                    .sort((a, b) => {
                      const dayCompare = (a.day_of_week || 0) - (b.day_of_week || 0);
                      if (dayCompare !== 0) return dayCompare;
                      return (a.start_time || '').localeCompare(b.start_time || '');
                    })
                    .map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entry.day_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.start_time} - {entry.end_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.period_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{entry.subject_name}</div>
                          <div className="text-xs text-gray-500">{entry.subject_code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.faculty_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.classroom_name}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : selectedBatch && !loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Timetable Generated Yet
          </h3>
          <p className="text-gray-600">
            Click "Generate Timetable" to create an optimized schedule for the selected batch.
          </p>
        </div>
      )}

      {!selectedBatch && !loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-orange-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Select a Batch to Get Started
          </h3>
          <p className="text-gray-600">
            Choose a batch from the dropdown above to generate or view timetables.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimetableGenerator;