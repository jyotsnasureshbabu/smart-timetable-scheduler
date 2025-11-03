import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, Building2, 
  GraduationCap, Clock, Calendar, BarChart3,
  Menu, X, LogOut, UserCircle, Settings
} from 'lucide-react';

const Layout = ({ children, setIsAuthenticated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/faculty', icon: Users, label: 'Faculty' },
    { path: '/subjects', icon: BookOpen, label: 'Subjects' },
    { path: '/classrooms', icon: Building2, label: 'Classrooms' },
    { path: '/batches', icon: GraduationCap, label: 'Batches' },
    { path: '/time-slots', icon: Clock, label: 'Time Slots' },
    { path: '/timetable-generator', icon: Calendar, label: 'Timetable Generator' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-primary-600">📚 Timetable</h1>
          ) : (
            <span className="text-2xl">📚</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mx-2 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t p-4">
          <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center'}`}>
            <UserCircle size={32} className="text-gray-600" />
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {user.username || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user.role || 'Faculty'}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} />
              <span className="ml-2">Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;