import { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Filter,
  Layers,
  Navigation,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Info,
  Calendar,
  DollarSign,
  Users,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import clsx from 'clsx';

// Mock data for projects with locations
const projectLocations = [
  {
    id: 'PRJ-2023-001',
    name: 'Aba-Umuahia Expressway Expansion',
    lat: 5.1058,
    lng: 7.3668,
    status: 'In Progress',
    progress: 65,
    budget: '₦1.2B',
    lga: 'Aba North',
    contractor: 'Abia Infrastructure Ltd',
    category: 'Transportation',
    priority: 'High'
  },
  {
    id: 'PRJ-2023-002',
    name: 'Umuahia General Hospital Upgrade',
    lat: 5.5250,
    lng: 7.4951,
    status: 'Completed',
    progress: 100,
    budget: '₦450M',
    lga: 'Umuahia North',
    contractor: 'Medical Facilities Nigeria',
    category: 'Healthcare',
    priority: 'Medium'
  },
  {
    id: 'PRJ-2023-003',
    name: 'Aba South Water Treatment Plant',
    lat: 5.0760,
    lng: 7.3665,
    status: 'Delayed',
    progress: 30,
    budget: '₦780M',
    lga: 'Aba South',
    contractor: 'Aqua Systems Ltd',
    category: 'Water & Sanitation',
    priority: 'High'
  },
  {
    id: 'PRJ-2023-004',
    name: 'Arochukwu Road Network',
    lat: 5.3902,
    lng: 7.9124,
    status: 'In Progress',
    progress: 45,
    budget: '₦650M',
    lga: 'Arochukwu',
    contractor: 'Road Masters Nigeria',
    category: 'Transportation',
    priority: 'Medium'
  },
  {
    id: 'PRJ-2023-005',
    name: 'Bende Education Complex',
    lat: 5.5583,
    lng: 7.6356,
    status: 'In Progress',
    progress: 72,
    budget: '₦920M',
    lga: 'Bende',
    contractor: 'Education Builders Ltd',
    category: 'Education',
    priority: 'High'
  },
  {
    id: 'PRJ-2023-006',
    name: 'Osisioma Housing Development',
    lat: 5.1500,
    lng: 7.3500,
    status: 'Not Started',
    progress: 0,
    budget: '₦1.5B',
    lga: 'Osisioma',
    contractor: 'Housing Solutions Nigeria',
    category: 'Housing',
    priority: 'Low'
  }
];

const categories = ['All Categories', 'Transportation', 'Healthcare', 'Water & Sanitation', 'Education', 'Housing'];
const statuses = ['All Status', 'In Progress', 'Completed', 'Delayed', 'Not Started'];
const lgas = ['All LGAs', 'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'];

const statusColors = {
  'Completed': '#10b981',
  'In Progress': '#3b82f6',
  'Delayed': '#ef4444',
  'Not Started': '#6b7280'
};

const categoryIcons = {
  'Transportation': '🛣️',
  'Healthcare': '🏥',
  'Water & Sanitation': '💧',
  'Education': '🏫',
  'Housing': '🏠'
};

export default function MapView() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [lgaFilter, setLgaFilter] = useState('All LGAs');
  const [searchTerm, setSearchTerm] = useState('');
  const [mapView, setMapView] = useState('satellite'); // satellite, street, terrain
  const [showLegend, setShowLegend] = useState(true);

  const filteredProjects = projectLocations.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.lga.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || project.category === categoryFilter;
    const matchesStatus = statusFilter === 'All Status' || project.status === statusFilter;
    const matchesLGA = lgaFilter === 'All LGAs' || project.lga === lgaFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLGA;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Map View</h1>
          <p className="text-gray-600">Interactive map showing project locations across Abia State.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={() => setShowLegend(!showLegend)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Layers className="h-4 w-4" />
            <span>Legend</span>
          </button>
          <select
            value={mapView}
            onChange={(e) => setMapView(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500"
          >
            <option value="satellite">Satellite</option>
            <option value="street">Street</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={lgaFilter}
              onChange={(e) => setLgaFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500"
            >
              {lgas.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="card p-0 overflow-hidden">
            <div className="relative bg-gradient-to-br from-blue-50 to-green-50 h-[600px]">
              {/* Mock Map Background */}
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Interactive Map</p>
                  <p className="text-sm text-gray-500">Abia State Project Locations</p>
                </div>
              </div>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
                  <ZoomIn className="h-4 w-4 text-gray-600" />
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
                  <ZoomOut className="h-4 w-4 text-gray-600" />
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
                  <Navigation className="h-4 w-4 text-gray-600" />
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
                  <RotateCcw className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Project Markers */}
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${20 + (index * 15) % 60}%`,
                    top: `${30 + (index * 12) % 40}%`
                  }}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="relative">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: statusColors[project.status] }}
                    />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full flex items-center justify-center text-xs">
                      {categoryIcons[project.category]}
                    </div>
                  </div>
                </div>
              ))}

              {/* Legend */}
              {showLegend && (
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                  <h4 className="font-semibold text-gray-900 mb-3">Map Legend</h4>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">Status</div>
                    {Object.entries(statusColors).map(([status, color]) => (
                      <div key={status} className="flex items-center space-x-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-gray-600">{status}</span>
                      </div>
                    ))}
                    <div className="text-sm font-medium text-gray-700 mt-3 mb-1">Categories</div>
                    {Object.entries(categoryIcons).map(([category, icon]) => (
                      <div key={category} className="flex items-center space-x-2 text-sm">
                        <span>{icon}</span>
                        <span className="text-gray-600">{category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project List Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Projects ({filteredProjects.length})</h3>
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={clsx(
                    'p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedProject?.id === project.id 
                      ? 'border-abia-300 bg-abia-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-start space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: statusColors[project.status] }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{project.lga} • {project.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600">{project.progress}% complete</span>
                        <span className="text-xs font-medium text-gray-900">{project.budget}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: statusColors[selectedProject.status] }}
                  />
                  <h2 className="text-xl font-bold text-gray-900">{selectedProject.name}</h2>
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Project Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`status-badge ${
                        selectedProject.status === 'Completed' ? 'status-completed' :
                        selectedProject.status === 'In Progress' ? 'status-in-progress' :
                        selectedProject.status === 'Delayed' ? 'status-delayed' : 'status-not-started'
                      }`}>
                        {selectedProject.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-semibold">{selectedProject.budget}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold">{selectedProject.lga} LGA</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold">{selectedProject.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Contractor:</span>
                      <span className="font-semibold">{selectedProject.contractor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`status-badge ${
                        selectedProject.priority === 'High' ? 'bg-red-100 text-red-800' :
                        selectedProject.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedProject.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Progress Tracking</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm">Overall Progress</span>
                        <span className="font-bold text-lg">{selectedProject.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full"
                          style={{ 
                            width: `${selectedProject.progress}%`,
                            backgroundColor: statusColors[selectedProject.status]
                          }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="btn-secondary text-sm py-2">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        <button className="btn-secondary text-sm py-2">
                          <Navigation className="h-4 w-4 mr-1" />
                          Get Directions
                        </button>
                        <button className="btn-secondary text-sm py-2">
                          <Info className="h-4 w-4 mr-1" />
                          Project Info
                        </button>
                        <button className="btn-secondary text-sm py-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          Timeline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Project ID: {selectedProject.id}
                  </div>
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="btn-primary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
