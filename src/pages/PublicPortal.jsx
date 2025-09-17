import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Eye,
  Filter,
  TrendingUp,
  Users,
  Building,
  Award,
  ExternalLink,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

// Mock data for public portal
const publicProjects = [
  {
    id: 'PRJ-2023-001',
    name: 'Aba-Umuahia Expressway Expansion',
    description: 'Expansion of the Aba-Umuahia Expressway from 4 to 8 lanes to reduce traffic congestion and improve connectivity across Abia State.',
    lga: 'Aba North',
    contractor: 'Abia Infrastructure Ltd',
    budget: '₦1.2B',
    progress: 65,
    status: 'In Progress',
    startDate: '2023-01-15',
    expectedCompletion: '2024-06-30',
    beneficiaries: '2.5M residents',
    category: 'Transportation',
    lastUpdate: '2 days ago',
    image: '/api/placeholder/400/200'
  },
  {
    id: 'PRJ-2023-002',
    name: 'Umuahia General Hospital Upgrade',
    description: 'Modernization of Umuahia General Hospital with a new 200-bed facility and specialized units for maternal and child health.',
    lga: 'Umuahia North',
    contractor: 'Medical Facilities Nigeria',
    budget: '₦450M',
    progress: 100,
    status: 'Completed',
    startDate: '2022-11-10',
    expectedCompletion: '2023-09-30',
    beneficiaries: '800K residents',
    category: 'Healthcare',
    lastUpdate: '1 week ago',
    image: '/api/placeholder/400/200'
  },
  {
    id: 'PRJ-2023-003',
    name: 'Aba South Water Treatment Plant',
    description: 'Construction of modern water treatment facility to provide clean water access to underserved communities in Aba South.',
    lga: 'Aba South',
    contractor: 'Aqua Systems Ltd',
    budget: '₦780M',
    progress: 30,
    status: 'In Progress',
    startDate: '2023-02-20',
    expectedCompletion: '2024-02-20',
    beneficiaries: '1.2M residents',
    category: 'Water & Sanitation',
    lastUpdate: '3 days ago',
    image: '/api/placeholder/400/200'
  }
];

const categories = ['All Categories', 'Transportation', 'Healthcare', 'Water & Sanitation', 'Education', 'Housing'];
const lgas = ['All LGAs', 'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'];

const statusStyles = {
  'Completed': 'status-completed',
  'In Progress': 'status-in-progress',
  'Delayed': 'status-delayed',
  'Not Started': 'status-not-started'
};

export default function PublicPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [lgaFilter, setLgaFilter] = useState('All LGAs');
  const [selectedProject, setSelectedProject] = useState(null);

  const filteredProjects = publicProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || project.category === categoryFilter;
    const matchesLGA = lgaFilter === 'All LGAs' || project.lga === lgaFilter;
    
    return matchesSearch && matchesCategory && matchesLGA;
  });

  const totalBudget = publicProjects.reduce((sum, project) => {
    return sum + parseFloat(project.budget.replace('₦', '').replace('B', '000000000').replace('M', '000000'));
  }, 0);

  const completedProjects = publicProjects.filter(p => p.status === 'Completed').length;
  const activeProjects = publicProjects.filter(p => p.status === 'In Progress').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Header */}
      <header className="bg-abia-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-abia-600 font-bold text-sm">APT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Abia Project Tracker</h1>
                <p className="text-abia-100 text-sm">Public Transparency Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-abia-100 hover:text-white text-sm">
                Government Portal
              </Link>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>+234 800 ABIA GOV</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Transparency in Action
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track the progress of government projects across Abia State. See how your tax money is being used to build a better future for all citizens.
          </p>
          
          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{publicProjects.length}</p>
              <p className="text-gray-600">Active Projects</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">{completedProjects}</p>
              <p className="text-gray-600">Completed</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600">₦2.4B</p>
              <p className="text-gray-600">Total Investment</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">4.5M</p>
              <p className="text-gray-600">Citizens Benefited</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={lgaFilter}
                onChange={(e) => setLgaFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
              >
                {lgas.map(lga => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <Building className="h-16 w-16 text-gray-400" />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{project.category} • {project.lga}</p>
                  </div>
                  <span className={clsx('status-badge ml-2', statusStyles[project.status])}>
                    {project.status}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{project.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={clsx(
                        'h-2 rounded-full',
                        project.status === 'Completed' ? 'bg-green-500' :
                        project.status === 'Delayed' ? 'bg-red-500' : 'bg-abia-600'
                      )}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {project.budget}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {project.beneficiaries}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(project.expectedCompletion).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Building className="h-3 w-3 mr-1" />
                    {project.contractor}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProject(project)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="bg-white rounded-lg shadow-sm border p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">About APT</h3>
              <p className="text-gray-600 text-sm mb-4">
                The Abia Project Tracker promotes transparency and accountability in government projects across Abia State.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-abia-600 hover:text-abia-700">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="text-abia-600 hover:text-abia-700">
                  <Mail className="h-5 w-5" />
                </a>
                <a href="#" className="text-abia-600 hover:text-abia-700">
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-abia-600">All Projects</a></li>
                <li><a href="#" className="text-gray-600 hover:text-abia-600">Project Reports</a></li>
                <li><a href="#" className="text-gray-600 hover:text-abia-600">Budget Information</a></li>
                <li><a href="#" className="text-gray-600 hover:text-abia-600">Contact Government</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Abia State Government</p>
                <p>Government House, Umuahia</p>
                <p>Phone: +234 800 ABIA GOV</p>
                <p>Email: info@abiastate.gov.ng</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Abia State Government. All rights reserved. | Powered by Kreatix Technologies
            </p>
          </div>
        </footer>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
                    <Building className="h-20 w-20 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Project Description</h3>
                      <p className="text-gray-700">{selectedProject.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Expected Impact</h3>
                      <p className="text-gray-700">
                        This project will directly benefit {selectedProject.beneficiaries} in {selectedProject.lga} LGA, 
                        improving quality of life and supporting economic development in the region.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={clsx('status-badge', statusStyles[selectedProject.status])}>
                            {selectedProject.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-semibold">{selectedProject.budget}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-semibold">{selectedProject.lga} LGA</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contractor:</span>
                          <span className="font-semibold">{selectedProject.contractor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-semibold">{new Date(selectedProject.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Completion:</span>
                          <span className="font-semibold">{new Date(selectedProject.expectedCompletion).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Progress Tracking</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Overall Progress</span>
                          <span className="font-bold text-lg">{selectedProject.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={clsx(
                              'h-3 rounded-full',
                              selectedProject.status === 'Completed' ? 'bg-green-500' :
                              selectedProject.status === 'Delayed' ? 'bg-red-500' : 'bg-abia-600'
                            )}
                            style={{ width: `${selectedProject.progress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          Last updated: {selectedProject.lastUpdate}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Transparency Note</h4>
                      <p className="text-sm text-gray-600">
                        This information is updated regularly based on contractor submissions and M&E team verifications. 
                        For questions or concerns, contact the Abia State Government directly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
