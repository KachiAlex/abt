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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-abia-600 to-abia-800 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-extrabold text-lg">GPT</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Government Project Tracker</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block font-medium">Digital Accountability Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                to="/public" 
                className="text-gray-700 dark:text-gray-300 hover:text-abia-600 dark:hover:text-abia-400 text-sm font-semibold transition-colors"
              >
                Public Portal
              </Link>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                <Phone className="h-5 w-5" />
                <span className="hidden sm:inline">+234 800 GOV HEL</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-20">
          {/* Animated logo */}
          <div className="w-28 h-28 bg-gradient-to-br from-abia-500 via-abia-600 to-abia-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-500">
            <span className="text-white font-extrabold text-3xl drop-shadow-lg">GPT</span>
          </div>
          
          {/* Main heading with gradient */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-abia-600 via-blue-600 to-abia-800 bg-clip-text text-transparent">
              Welcome to Government
            </span>
            <br />
            Project Tracker
          </h1>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-4 max-w-3xl mx-auto font-medium">
            Enhancing Transparency, Accountability & Public Trust
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Empowering citizens with real-time access to government project data across Abia State
          </p>
          
          {/* Animated Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 mt-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-abia-500 to-abia-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Selection */}
        <div className="pb-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Access Your Dashboard</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-medium">
              Choose your role to access the appropriate dashboard and features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <div
                  key={role.id}
                  className={`group bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                    isSelected 
                      ? 'border-abia-500 shadow-2xl ring-4 ring-abia-500/20 scale-105' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-abia-300 dark:hover:border-abia-600 hover:shadow-2xl'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="p-10 text-center">
                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                      isSelected 
                        ? 'bg-gradient-to-br from-abia-500 to-abia-700 transform scale-110' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 group-hover:scale-110'
                    }`}>
                      <Icon className={`h-12 w-12 ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{role.name}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-8 font-medium">{role.description}</p>
                    
                    <div className="space-y-3 mb-8">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-center text-base text-gray-700 dark:text-gray-300 font-medium">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
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
                className={`inline-flex items-center px-10 py-5 rounded-2xl text-white font-bold text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl ${
                  roles.find(r => r.id === selectedRole)?.color || 'bg-gradient-to-r from-abia-600 to-abia-700 hover:from-abia-700 hover:to-abia-800'
                }`}
              >
                <LogIn className="mr-3 h-6 w-6" />
                Sign In as {roles.find(r => r.id === selectedRole)?.name}
                <ArrowRight className="ml-3 h-6 w-6" />
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
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Platform Features</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-medium">
              Comprehensive tools for effective project management and monitoring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-abia-500 to-abia-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-base font-medium">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demo Navigation */}
        <div className="bg-gradient-to-br from-abia-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-12 mb-20 shadow-2xl border border-abia-200 dark:border-gray-600">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Quick Access</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">Explore different sections of the platform</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link to="/dashboard" className="group bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-abia-600 hover:to-abia-700 text-gray-900 dark:text-white hover:text-white font-bold px-6 py-5 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 flex items-center justify-center space-x-3 transform hover:-translate-y-2">
              <Building className="h-6 w-6" />
              <span className="text-base">Admin Dashboard</span>
            </Link>
            <Link to="/contractor/dashboard" className="group bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 text-gray-900 dark:text-white hover:text-white font-bold px-6 py-5 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 flex items-center justify-center space-x-3 transform hover:-translate-y-2">
              <Users className="h-6 w-6" />
              <span className="text-base">Contractor Portal</span>
            </Link>
            <Link to="/me/dashboard" className="group bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-green-600 hover:to-green-700 text-gray-900 dark:text-white hover:text-white font-bold px-6 py-5 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 flex items-center justify-center space-x-3 transform hover:-translate-y-2">
              <FileText className="h-6 w-6" />
              <span className="text-base">M&E Dashboard</span>
            </Link>
            <Link to="/projects/PRJ-2023-001" className="group bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-purple-700 text-gray-900 dark:text-white hover:text-white font-bold px-6 py-5 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 flex items-center justify-center space-x-3 transform hover:-translate-y-2">
              <CheckCircle className="h-6 w-6" />
              <span className="text-base">Project Details</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-abia-600 to-abia-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-extrabold text-xl">GPT</span>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold">Government Project Tracker</h3>
                  <p className="text-gray-400 text-base font-medium">Digital Accountability Platform</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                Enhancing transparency, accountability, and public trust in government project management and delivery.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:scale-125 duration-300">
                  <Globe className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:scale-125 duration-300">
                  <Mail className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:scale-125 duration-300">
                  <Phone className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-extrabold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-base">
                <li><Link to="/public" className="text-gray-400 hover:text-white font-medium transition-colors">Public Portal</Link></li>
                <li><Link to="/projects" className="text-gray-400 hover:text-white font-medium transition-colors">All Projects</Link></li>
                <li><Link to="/analytics" className="text-gray-400 hover:text-white font-medium transition-colors">Analytics</Link></li>
                <li><Link to="/reports" className="text-gray-400 hover:text-white font-medium transition-colors">Reports</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-extrabold mb-6">Contact</h4>
              <div className="space-y-3 text-base text-gray-300 font-medium">
                <p>Government Project Office</p>
                <p>Government Secretariat</p>
                <p>Phone: +234 800 GOV HEL</p>
                <p>Email: info@gpt-system.gov</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-base text-gray-400 font-medium">
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
