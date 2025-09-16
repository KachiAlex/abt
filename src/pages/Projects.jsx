import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MapPin, 
  Calendar, 
  DollarSign,
  User,
  MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const projects = [
  {
    id: 'PRJ-2023-001',
    name: 'Lekki-Epe Expressway Expansion',
    lga: 'Eti-Osa',
    contractor: 'Lagos Infrastructure Ltd',
    timeline: '1/15/2023 to 6/30/2024',
    budget: '₦1.2B',
    status: 'In Progress',
    progress: 65,
    lastUpdate: '2 days ago'
  },
  {
    id: 'PRJ-2023-002',
    name: 'Ikorodu Healthcare Center',
    lga: 'Ikorodu',
    contractor: 'Medical Facilities Nigeria',
    timeline: '11/10/2022 to 9/30/2023',
    budget: '₦450M',
    status: 'Completed',
    progress: 100,
    lastUpdate: '1 week ago'
  },
  {
    id: 'PRJ-2023-003',
    name: 'Alimosho Water Project',
    lga: 'Alimosho',
    contractor: 'Aqua Systems Ltd',
    timeline: '2/20/2023 to 2/20/2024',
    budget: '₦780M',
    status: 'Delayed',
    progress: 30,
    lastUpdate: '3 days ago'
  },
  {
    id: 'PRJ-2023-004',
    name: 'Surulere Road Rehabilitation',
    lga: 'Surulere',
    contractor: 'Road Masters Nigeria',
    timeline: '3/5/2023 to 12/15/2023',
    budget: '₦650M',
    status: 'In Progress',
    progress: 45,
    lastUpdate: 'Yesterday'
  }
];

const statusOptions = ['All Statuses', 'In Progress', 'Completed', 'Delayed', 'Not Started'];
const lgaOptions = ['All LGAs', 'Eti-Osa', 'Ikorodu', 'Alimosho', 'Surulere', 'Ikeja', 'Kosofe'];

const statusStyles = {
  'Completed': 'status-completed',
  'In Progress': 'status-in-progress',
  'Delayed': 'status-delayed',
  'Not Started': 'status-not-started'
};

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [lgaFilter, setLgaFilter] = useState('All LGAs');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || project.status === statusFilter;
    const matchesLGA = lgaFilter === 'All LGAs' || project.lga === lgaFilter;
    
    return matchesSearch && matchesStatus && matchesLGA;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage and monitor all projects across Abia State.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <Link to="/projects/new" className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add New Project</span>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2 lg:hidden"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>

            <div className={clsx(
              'flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4',
              showFilters ? 'block' : 'hidden lg:flex'
            )}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <select
                value={lgaFilter}
                onChange={(e) => setLgaFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
              >
                {lgaOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-gray-900">{projects.length}</h3>
          <p className="text-sm text-gray-600">Total Projects</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-green-600">
            {projects.filter(p => p.status === 'Completed').length}
          </h3>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-yellow-600">
            {projects.filter(p => p.status === 'In Progress').length}
          </h3>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-red-600">
            {projects.filter(p => p.status === 'Delayed').length}
          </h3>
          <p className="text-sm text-gray-600">Delayed</p>
        </div>
      </div>

      {/* Projects Table */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Projects</h3>
          <p className="text-sm text-gray-600">A comprehensive list of all projects in the Abia Project Tracker system.</p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Project Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">LGA</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Contractor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Timeline</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Budget</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Progress</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-mono text-gray-600">{project.id}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">Updated: {project.lastUpdate}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{project.lga}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{project.contractor}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{project.timeline}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{project.budget}</td>
                  <td className="py-4 px-4">
                    <span className={clsx('status-badge', statusStyles[project.status])}>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                        <div 
                          className={clsx(
                            'h-2 rounded-full',
                            project.status === 'Completed' ? 'bg-green-500' :
                            project.status === 'Delayed' ? 'bg-red-500' : 'bg-yellow-500'
                          )}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 min-w-[30px]">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-abia-600 hover:text-abia-700 p-1 rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-500 font-mono">{project.id}</p>
                </div>
                <span className={clsx('status-badge', statusStyles[project.status])}>
                  {project.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  {project.lga}
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-3 w-3 mr-1" />
                  {project.contractor}
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {project.budget}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-3 w-3 mr-1" />
                  {project.lastUpdate}
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={clsx(
                      'h-2 rounded-full',
                      project.status === 'Completed' ? 'bg-green-500' :
                      project.status === 'Delayed' ? 'bg-red-500' : 'bg-yellow-500'
                    )}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <Link
                  to={`/projects/${project.id}`}
                  className="text-abia-600 hover:text-abia-700 text-sm font-medium flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FolderOpen className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <Link to="/projects/new" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add New Project</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
