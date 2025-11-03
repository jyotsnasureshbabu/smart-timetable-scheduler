import { useState, useEffect } from 'react';
import { reportsAPI, batchAPI, autoScheduleAPI } from '../services/api';
import { BarChart3, Users, Building2, TrendingUp, AlertCircle } from 'lucide-react';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
    fetchBatches();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await reportsAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await batchAPI.getAll();
      setBatches(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const analyzeSchedule = async () => {
    if (!selectedBatch) {
      alert('Please select a batch first!');
      return;
    }

    setLoading(true);
    try {
      const response = await autoScheduleAPI.analyze(selectedBatch);
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing schedule:', error);
      alert('Failed to analyze schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <BarChart3 className="mr-3" size={36} />
          Reports & Analytics
        </h1>
        <p className="text-green-100 text-lg">
          View system statistics and timetable analysis
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Faculty</h3>
            <p className="text-3xl font-bold text-gray-800">{summary.faculty_count}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <BarChart3 className="text-green-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Subjects</h3>
            <p className="text-3xl font-bold text-gray-800">{summary.subject_count}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building2 className="text-purple-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Classrooms</h3>
            <p className="text-3xl font-bold text-gray-800">{summary.classroom_count}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <BarChart3 className="text-orange-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Timetable Entries</h3>
            <p className="text-3xl font-bold text-gray-800">{summary.timetable_entries}</p>
          </div>
        </div>
      )}

      {/* Schedule Analysis Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule Analysis</h2>
        
        <div className="flex space-x-4 mb-6">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">-- Select a Batch --</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>
                {batch.name} - {batch.department}
              </option>
            ))}
          </select>

          <button
            onClick={analyzeSchedule}
            disabled={loading || !selectedBatch}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {analysis && (
          <div className="space-y-6">
            {/* Completion Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm text-gray-600 mb-2">Total Scheduled</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {analysis.analysis.totalScheduled} periods
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm text-gray-600 mb-2">Total Required</h4>
                <p className="text-2xl font-bold text-green-600">
                  {analysis.analysis.totalRequired} periods
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm text-gray-600 mb-2">Completion Rate</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {analysis.analysis.completionRate}%
                </p>
              </div>
            </div>

            {/* Missing Subjects */}
            {analysis.analysis.missingSubjects.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                  <AlertCircle className="mr-2" size={20} />
                  Subjects Needing More Periods
                </h4>
                <div className="space-y-2">
                  {analysis.analysis.missingSubjects.map((subject, index) => (
                    <div key={index} className="bg-white rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">{subject.subject}</span>
                        <span className="text-sm text-orange-600">
                          Missing: {subject.missing} periods
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Scheduled: {subject.scheduled} / Required: {subject.required}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Over Scheduled Subjects */}
            {analysis.analysis.overScheduled.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                  <AlertCircle className="mr-2" size={20} />
                  Over-Scheduled Subjects
                </h4>
                <div className="space-y-2">
                  {analysis.analysis.overScheduled.map((subject, index) => (
                    <div key={index} className="bg-white rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">{subject.subject}</span>
                        <span className="text-sm text-red-600">
                          Excess: {subject.excess} periods
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Scheduled: {subject.scheduled} / Required: {subject.required}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.analysis.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {analysis.analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Message */}
            {analysis.analysis.completionRate === 100 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center text-green-900">
                  <TrendingUp className="mr-2" size={20} />
                  <span className="font-semibold">
                    Perfect! All subjects are scheduled correctly.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {!analysis && !loading && (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
            <p>Select a batch and click "Analyze" to view detailed reports</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;