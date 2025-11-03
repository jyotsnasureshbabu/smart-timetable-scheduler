import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import { Users, BookOpen, Building2, GraduationCap, Calendar, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    faculty_count: 0,
    subject_count: 0,
    classroom_count: 0,
    batch_count: 0,
    timetable_entries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await reportsAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Faculty',
      value: summary.faculty_count,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Subjects',
      value: summary.subject_count,
      icon: BookOpen,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Classrooms',
      value: summary.classroom_count,
      icon: Building2,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Total Batches',
      value: summary.batch_count,
      icon: GraduationCap,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      label: 'Timetable Entries',
      value: summary.timetable_entries,
      icon: Calendar,
      color: 'bg-pink-500',
      lightColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to Timetable Scheduler 📚
        </h1>
        <p className="text-blue-100 text-lg">
          Manage your academic schedules efficiently with automated timetable generation
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.lightColor} p-3 rounded-lg`}>
                  <Icon className={stat.textColor} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="mr-2" size={24} />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/timetable-generator"
            className="p-4 border-2 border-primary-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
          >
            <Calendar className="mx-auto mb-2 text-primary-600" size={32} />
            <h3 className="font-semibold text-gray-800">Generate Timetable</h3>
            <p className="text-sm text-gray-600 mt-1">Create automated schedules</p>
          </a>
          
          <a
            href="/faculty"
            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
          >
            <Users className="mx-auto mb-2 text-blue-600" size={32} />
            <h3 className="font-semibold text-gray-800">Manage Faculty</h3>
            <p className="text-sm text-gray-600 mt-1">Add or update faculty members</p>
          </a>
          
          <a
            href="/reports"
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center"
          >
            <TrendingUp className="mx-auto mb-2 text-green-600" size={32} />
            <h3 className="font-semibold text-gray-800">View Reports</h3>
            <p className="text-sm text-gray-600 mt-1">Analyze workload and utilization</p>
          </a>
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-700">System initialized successfully</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Database connected</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Ready to generate timetables</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;