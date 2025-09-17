import { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Download,
  Upload,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Building,
  Key,
  Database,
  Monitor,
  Smartphone,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    reports: true,
    deadlines: true,
    approvals: false
  });
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('WAT');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'system', name: 'System', icon: Database }
  ];

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      activeTab === tab.id
                        ? 'bg-abia-100 text-abia-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className={clsx(
                      'mr-3 h-4 w-4',
                      activeTab === tab.id ? 'text-abia-500' : 'text-gray-400'
                    )} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                
                {/* Profile Photo */}
                <div className="flex items-center space-x-6 mb-6">
                  <div className="w-20 h-20 bg-abia-100 rounded-full flex items-center justify-center">
                    <span className="text-abia-600 font-semibold text-xl">JD</span>
                  </div>
                  <div>
                    <button className="btn-secondary mr-3">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm">
                      Remove
                    </button>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        defaultValue="john.doe@abiastate.gov.ng"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        defaultValue="+234 803 123 4567"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      defaultValue="Government Official"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent">
                        <option>Ministry of Works</option>
                        <option>Ministry of Health</option>
                        <option>Ministry of Education</option>
                        <option>Ministry of Water Resources</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      defaultValue="Government House, Umuahia"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      defaultValue="Umuahia"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      defaultValue="Abia State"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Communication</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={() => handleNotificationChange('email')}
                        className="rounded border-gray-300 text-abia-600 focus:ring-abia-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={() => handleNotificationChange('sms')}
                        className="rounded border-gray-300 text-abia-600 focus:ring-abia-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                        <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={() => handleNotificationChange('push')}
                        className="rounded border-gray-300 text-abia-600 focus:ring-abia-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Content</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Report Updates</span>
                        <p className="text-sm text-gray-500">New reports and analytics</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.reports}
                        onChange={() => handleNotificationChange('reports')}
                        className="rounded border-gray-300 text-abia-600 focus:ring-abia-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Project Deadlines</span>
                        <p className="text-sm text-gray-500">Upcoming project deadlines</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.deadlines}
                        onChange={() => handleNotificationChange('deadlines')}
                        className="rounded border-gray-300 text-abia-600 focus:ring-abia-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Approval Requests</span>
                        <p className="text-sm text-gray-500">New items requiring approval</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.approvals}
                        onChange={() => handleNotificationChange('approvals')}
                        className="rounded border-gray-300 text-abia-600 focus:ring-abia-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Password & Authentication</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        At least 8 characters long
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Contains uppercase and lowercase letters
                      </li>
                      <li className="flex items-center">
                        <X className="h-4 w-4 text-red-500 mr-2" />
                        Contains at least one number
                      </li>
                      <li className="flex items-center">
                        <X className="h-4 w-4 text-red-500 mr-2" />
                        Contains at least one special character
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Two-Factor Authentication</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Enhanced Security</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button className="btn-primary">
                      <Key className="h-4 w-4 mr-2" />
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Sessions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Monitor className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Windows PC - Chrome</p>
                        <p className="text-sm text-gray-500">Lagos, Nigeria • Current session</p>
                      </div>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">iPhone - Safari</p>
                        <p className="text-sm text-gray-500">Abuja, Nigeria • 2 hours ago</p>
                      </div>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-700">Revoke</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Theme Preferences</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Color Theme
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['light', 'dark', 'auto'].map((themeOption) => (
                        <label key={themeOption} className="cursor-pointer">
                          <input
                            type="radio"
                            name="theme"
                            value={themeOption}
                            checked={theme === themeOption}
                            onChange={(e) => setTheme(e.target.value)}
                            className="sr-only"
                          />
                          <div className={clsx(
                            'p-4 border-2 rounded-lg transition-colors',
                            theme === themeOption 
                              ? 'border-abia-500 bg-abia-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          )}>
                            <div className="flex items-center space-x-3">
                              <div className={clsx(
                                'w-8 h-8 rounded-full',
                                themeOption === 'light' ? 'bg-white border border-gray-300' :
                                themeOption === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-r from-white to-gray-900'
                              )} />
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {themeOption}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Language & Region</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="ig">Igbo</option>
                        <option value="ha">Hausa</option>
                        <option value="yo">Yoruba</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                    >
                      <option value="WAT">West Africa Time (WAT)</option>
                      <option value="GMT">Greenwich Mean Time (GMT)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Export Data</h4>
                      <p className="text-sm text-blue-700">Download your account data and project information</p>
                    </div>
                    <button className="btn-secondary">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900">Backup Settings</h4>
                      <p className="text-sm text-yellow-700">Create a backup of your preferences and data</p>
                    </div>
                    <button className="btn-secondary">
                      <Upload className="h-4 w-4 mr-2" />
                      Backup
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Actions</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-red-900">Danger Zone</h4>
                        <p className="text-sm text-red-700 mb-3">
                          These actions are irreversible. Please proceed with caution.
                        </p>
                        <div className="space-y-2">
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Deactivate Account
                          </button>
                          <br />
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">System Information</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application Version:</span>
                    <span className="font-medium">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">January 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database Version:</span>
                    <span className="font-medium">PostgreSQL 15.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Server Status:</span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
