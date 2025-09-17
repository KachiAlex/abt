import { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertTriangle,
  Building,
  Users,
  FileText,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roleInfo = {
  GOVERNMENT_ADMIN: {
    name: 'Government Administrator',
    icon: Building,
    description: 'Full system access and user management',
    redirectTo: '/dashboard'
  },
  GOVERNMENT_OFFICER: {
    name: 'Government Officer',
    icon: Building,
    description: 'Government dashboard and project oversight',
    redirectTo: '/dashboard'
  },
  CONTRACTOR: {
    name: 'Contractor',
    icon: Users,
    description: 'Project updates and milestone submissions',
    redirectTo: '/contractor/dashboard'
  },
  ME_OFFICER: {
    name: 'M&E Officer',
    icon: FileText,
    description: 'Review submissions and site inspections',
    redirectTo: '/me/dashboard'
  }
};

export default function SignInModal({ isOpen, onClose, onSignIn }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In demo mode, simulate authentication
      if (formData.email && formData.password) {
        // Demo credentials for different roles
        const demoCredentials = {
          'admin@abiastate.gov.ng': { 
            role: 'GOVERNMENT_ADMIN', 
            firstName: 'Chinedu', 
            lastName: 'Okafor',
            jobTitle: 'Chief of Staff',
            department: 'Office of the Governor'
          },
          'officer@abiastate.gov.ng': { 
            role: 'GOVERNMENT_OFFICER', 
            firstName: 'Ngozi', 
            lastName: 'Eze',
            jobTitle: 'Project Coordinator',
            department: 'Ministry of Works'
          },
          'contractor@abiainfra.com': { 
            role: 'CONTRACTOR', 
            firstName: 'Emeka', 
            lastName: 'Nwankwo',
            jobTitle: 'Project Manager',
            department: 'Abia Infrastructure Ltd'
          },
          'me@abiastate.gov.ng': { 
            role: 'ME_OFFICER', 
            firstName: 'Chioma', 
            lastName: 'Okoro',
            jobTitle: 'Senior M&E Officer',
            department: 'Project Monitoring Unit'
          }
        };

        const userInfo = demoCredentials[formData.email];
        
        if (userInfo && formData.password === 'demo123') {
          // Simulate successful login
          const authData = {
            user: {
              id: `user-${Date.now()}`,
              email: formData.email,
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              role: userInfo.role,
              jobTitle: userInfo.jobTitle,
              department: userInfo.department,
              phone: '+234 803 123 4567',
              city: 'Umuahia',
              state: 'Abia State'
            },
            token: 'demo-jwt-token'
          };

          // Store auth data in localStorage (demo purposes)
          localStorage.setItem('abt_auth', JSON.stringify(authData));
          
          onSignIn(authData);
          onClose();
          
          // Navigate to appropriate dashboard
          const roleData = roleInfo[userInfo.role];
          navigate(roleData.redirectTo);
        } else {
          setError('Invalid credentials. Use demo credentials provided below.');
        }
      } else {
        setError('Please enter both email and password');
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <p className="text-gray-600">Access the Abia Project Tracker</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Demo Mode</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This is a demonstration. In production, only administrators can create user accounts.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Demo Credentials</h4>
            <div className="space-y-3">
              {Object.entries(roleInfo).map(([role, info]) => {
                const Icon = info.icon;
                return (
                  <div key={role} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-abia-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-4 w-4 text-abia-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{info.name}</p>
                        <p className="text-xs text-gray-600">{info.description}</p>
                      </div>
                    </div>
                    <div className="ml-11 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Email:</span>
                        <code className="text-xs bg-white px-2 py-1 rounded border">
                          {role === 'GOVERNMENT_ADMIN' ? 'admin@abiastate.gov.ng' :
                           role === 'GOVERNMENT_OFFICER' ? 'officer@abiastate.gov.ng' :
                           role === 'CONTRACTOR' ? 'contractor@abiainfra.com' :
                           'me@abiastate.gov.ng'}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Password:</span>
                        <code className="text-xs bg-white px-2 py-1 rounded border">demo123</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">User:</span>
                        <span className="text-xs text-gray-700 font-medium">
                          {role === 'GOVERNMENT_ADMIN' ? 'Chinedu Okafor' :
                           role === 'GOVERNMENT_OFFICER' ? 'Ngozi Eze' :
                           role === 'CONTRACTOR' ? 'Emeka Nwankwo' :
                           'Chioma Okoro'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Secure access to Abia State government project data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
