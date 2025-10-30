import { useState } from 'react';
import { 
  Building, 
  Users, 
  FileText, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Phone,
  Mail,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SignInModal from '../components/Auth/SignInModal';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [selectedRole, setSelectedRole] = useState('government');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const { isAuthenticated, signIn } = useAuth();

  const roles = [
    {
      id: 'government',
      name: 'Government',
      icon: Building,
      description: 'Access the government official dashboard to manage all projects across government departments',
      features: ['Project Overview', 'Budget Tracking', 'Performance Analytics', 'Report Generation'],
      route: '/dashboard',
      color: 'bg-abia-600 hover:bg-abia-700'
    },
    {
      id: 'contractor',
      name: 'Contractor',
      icon: Users,
      description: 'Contractor portal for project updates, milestone submissions, and progress tracking',
      features: ['Project Updates', 'Milestone Tracking', 'File Uploads', 'Progress Reports'],
      route: '/contractor/dashboard',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'me-officer',
      name: 'M&E Officer',
      icon: FileText,
      description: 'Monitoring & Evaluation dashboard for reviewing submissions and site inspections',
      features: ['Review Submissions', 'Site Inspections', 'Quality Control', 'Approval Workflow'],
      route: '/me/dashboard',
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  const stats = [
    { label: 'Active Projects', value: '324', icon: Building },
    { label: 'LGAs Covered', value: '17', icon: Globe },
    { label: 'Budget Managed', value: '₦2.4B', icon: Star },
    { label: 'Contractors', value: '45+', icon: Users }
  ];

  const features = [
    {
      title: 'Real-time Tracking',
      description: 'Monitor project progress in real-time with live updates and notifications',
      icon: CheckCircle
    },
    {
      title: 'Transparent Reporting',
      description: 'Generate comprehensive reports for stakeholders and public transparency',
      icon: FileText
    },
    {
      title: 'Multi-role Access',
      description: 'Dedicated portals for government officials, contractors, and M&E officers',
      icon: Users
    },
    {
      title: 'Secure Platform',
      description: 'Enterprise-grade security with role-based access control and data protection',
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-abia-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">GPT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Government Project Tracker</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Digital Accountability Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/public" 
                className="text-gray-600 hover:text-abia-600 text-sm font-medium"
              >
                Public Portal
              </Link>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">+234 800 GOV HEL</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-abia-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-abia-600 font-bold text-2xl">GPT</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Government Project Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Enhancing Transparency, Accountability & Public Trust in Government Projects
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-blue-800 font-medium">Demo Mode: This is a UI prototype without authentication or backend functionality.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center">
                  <div className="w-12 h-12 bg-abia-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-abia-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Selection */}
        <div className="pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Select your role to access the platform</h2>
            <p className="text-gray-600">Choose your role to access the appropriate dashboard and features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <div
                  key={role.id}
                  className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer ${
                    isSelected ? 'border-abia-300 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                      isSelected ? 'bg-abia-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-8 w-8 ${isSelected ? 'text-abia-600' : 'text-gray-600'}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{role.name}</h3>
                    <p className="text-gray-600 mb-6">{role.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enter Button */}
          <div className="text-center">
            {selectedRole && (
              <button
                onClick={() => setShowSignInModal(true)}
                className={`inline-flex items-center px-8 py-4 rounded-lg text-white font-semibold text-lg transition-colors ${
                  roles.find(r => r.id === selectedRole)?.color || 'bg-abia-600 hover:bg-abia-700'
                }`}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign In as {roles.find(r => r.id === selectedRole)?.name}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Authorized access only. Contact your administrator for account access.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              By signing in, you agree to our{' '}
              <a href="#" className="text-abia-600 hover:text-abia-700">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-abia-600 hover:text-abia-700">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-gray-600">Comprehensive tools for effective project management and monitoring</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center">
                  <div className="w-12 h-12 bg-abia-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-abia-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demo Navigation */}
        <div className="bg-gray-50 rounded-xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo Navigation</h2>
            <p className="text-gray-600">Quick access to different sections of the platform</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/dashboard" className="btn-secondary flex items-center justify-center space-x-2 py-3">
              <Building className="h-4 w-4" />
              <span className="text-sm">Admin Dashboard</span>
            </Link>
            <Link to="/contractor/dashboard" className="btn-secondary flex items-center justify-center space-x-2 py-3">
              <Users className="h-4 w-4" />
              <span className="text-sm">Contractor Portal</span>
            </Link>
            <Link to="/me/dashboard" className="btn-secondary flex items-center justify-center space-x-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="text-sm">M&E Dashboard</span>
            </Link>
            <Link to="/projects/PRJ-2023-001" className="btn-secondary flex items-center justify-center space-x-2 py-3">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Project Details</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-abia-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GPT</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Government Project Tracker</h3>
                  <p className="text-gray-400 text-sm">Digital Accountability Platform</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Enhancing transparency, accountability, and public trust in government project management and delivery.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Mail className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/public" className="text-gray-400 hover:text-white">Public Portal</Link></li>
                <li><Link to="/projects" className="text-gray-400 hover:text-white">All Projects</Link></li>
                <li><Link to="/analytics" className="text-gray-400 hover:text-white">Analytics</Link></li>
                <li><Link to="/reports" className="text-gray-400 hover:text-white">Reports</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Government Project Office</p>
                <p>Government Secretariat</p>
                <p>Phone: +234 800 GOV HEL</p>
                <p>Email: info@gpt-system.gov</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2025 Government Project Tracker. All rights reserved. | Powered by Kreatix Technologies
            </p>
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      <SignInModal 
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignIn={signIn}
      />
    </div>
  );
}
