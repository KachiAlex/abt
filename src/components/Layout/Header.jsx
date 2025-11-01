import { Bell, Search, ChevronDown, Sun, Moon, LogOut, User, Settings, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ title = "Dashboard" }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications] = useState([
    { id: 1, text: "Aba South Water Project is 2 weeks behind schedule", type: "warning", time: "2 hours ago" },
    { id: 2, text: "Contractor uploaded new progress photos for Aba-Umuahia Expressway", type: "info", time: "5 hours ago" },
    { id: 3, text: "M&E Officer approved milestone for Umuahia Hospital Upgrade", type: "success", time: "Yesterday" },
  ]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = () => {
    // Clear all cached data
    localStorage.clear();
    signOut();
    navigate('/');
    // Force page reload to ensure clean state
    window.location.reload();
  };

  const handleClearCache = () => {
    // Clear auth cache and force re-login
    localStorage.removeItem('abt_auth');
    signOut();
    navigate('/');
    window.location.reload();
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'GOVERNMENT_ADMIN': 'Government Administrator',
      'GOVERNMENT_OFFICER': 'Government Officer', 
      'CONTRACTOR': 'Contractor',
      'ME_OFFICER': 'M&E Officer'
    };
    return roleNames[role] || role;
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-8 py-6">
        {/* Left side - Title and breadcrumb */}
        <div className="flex items-center space-x-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <div className="hidden md:block">
            <p className="text-base text-gray-500">Welcome back! Here's an overview of all projects across Abia State.</p>
          </div>
        </div>

        {/* Right side - Search, notifications, and user menu */}
        <div className="flex items-center space-x-6">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, contractors..."
              className="pl-10 pr-4 py-3 w-72 border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent"
            />
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <span className="text-sm text-gray-500">Recent alerts and updates</span>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                          notification.type === 'warning' ? 'bg-yellow-400' :
                          notification.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-abia-600 hover:text-abia-700 font-medium">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-abia-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500">
                  {user ? getRoleDisplayName(user.role) : 'Role'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user ? getRoleDisplayName(user.role) : 'Role'}
                  </p>
                </div>
                <div className="py-2">
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile Settings
                  </button>
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Preferences
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button 
                    onClick={handleClearCache}
                    className="w-full flex items-center px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-3" />
                    Clear Cache & Refresh
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
