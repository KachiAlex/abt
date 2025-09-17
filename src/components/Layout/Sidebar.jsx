import { useState } from 'react';
import { 
  Home, 
  FolderOpen, 
  Users, 
  BarChart3, 
  MapPin, 
  Settings, 
  Menu, 
  X,
  FileText,
  Plus,
  Download
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Contractors', href: '/contractors', icon: Users },
  { name: 'M&E Reports', href: '/reports', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Map View', href: '/map', icon: MapPin },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const quickActions = [
  { name: 'Add New Project', href: '/projects/new', icon: Plus, roles: ['GOVERNMENT_ADMIN'] },
  { name: 'Generate Report', href: '/reports', icon: Download, roles: ['GOVERNMENT_ADMIN', 'GOVERNMENT_OFFICER', 'ME_OFFICER'] },
];

export default function Sidebar({ userRole = 'Government Official' }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
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

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo and Header */}
        <div className="flex items-center justify-center h-16 px-4 bg-abia-600">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-abia-600 font-bold text-sm">APT</span>
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">Abia Project Tracker</h1>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-abia-100 rounded-full flex items-center justify-center">
              <span className="text-abia-600 font-semibold text-sm">{getUserInitials()}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500">{user ? getRoleDisplayName(user.role) : userRole}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                {user?.role === 'GOVERNMENT_ADMIN' ? 'Admin' : 
                 user?.role === 'ME_OFFICER' ? 'M&E' :
                 user?.role === 'CONTRACTOR' ? 'Contractor' : 'Officer'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-abia-100 text-abia-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-abia-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 px-2">
          <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="mt-2 space-y-1">
            {quickActions
              .filter(action => !action.roles || !user || action.roles.includes(user.role))
              .map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <action.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  {action.name}
                </Link>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Abia Project Tracker v1.0</p>
            <p>© 2025 Kreatix Technologies</p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
