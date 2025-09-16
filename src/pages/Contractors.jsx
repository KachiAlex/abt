import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Star,
  Phone,
  Mail,
  MapPin,
  Building,
  MoreHorizontal,
  User,
  Award,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const contractors = [
  {
    id: 'CON-001',
    name: 'Lagos Infrastructure Ltd',
    email: 'info@lagosinfra.com',
    phone: '+234 801 234 5678',
    contact: 'Adebayo Johnson',
    specialization: 'Road Construction',
    rating: 4.8,
    status: 'Active',
    projects: { completed: 12, ongoing: 3 },
    location: 'Lagos',
    joinDate: '2021-03-15',
    totalValue: '₦8.5B'
  },
  {
    id: 'CON-002',
    name: 'Medical Facilities Nigeria',
    email: 'contact@medfacilities.ng',
    phone: '+234 802 345 6789',
    contact: 'Sarah Okafor',
    specialization: 'Healthcare Infrastructure',
    rating: 4.5,
    status: 'Active',
    projects: { completed: 8, ongoing: 1 },
    location: 'Abuja',
    joinDate: '2020-11-20',
    totalValue: '₦3.2B'
  },
  {
    id: 'CON-003',
    name: 'Aqua Systems Ltd',
    email: 'info@aquasystems.com',
    phone: '+234 803 456 7890',
    contact: 'Michael Ade',
    specialization: 'Water Infrastructure',
    rating: 4.2,
    status: 'Active',
    projects: { completed: 5, ongoing: 2 },
    location: 'Port Harcourt',
    joinDate: '2022-01-10',
    totalValue: '₦2.8B'
  },
  {
    id: 'CON-004',
    name: 'Road Masters Nigeria',
    email: 'info@roadmasters.ng',
    phone: '+234 804 567 8901',
    contact: 'Funke Akindele',
    specialization: 'Road Construction',
    rating: 4.7,
    status: 'Active',
    projects: { completed: 15, ongoing: 2 },
    location: 'Kano',
    joinDate: '2019-08-05',
    totalValue: '₦6.1B'
  },
  {
    id: 'CON-005',
    name: 'Coastal Developers Ltd',
    email: 'contact@coastaldev.com',
    phone: '+234 805 678 9012',
    contact: 'John Obi',
    specialization: 'Marine Infrastructure',
    rating: 4.0,
    status: 'Inactive',
    projects: { completed: 3, ongoing: 0 },
    location: 'Lagos',
    joinDate: '2023-02-28',
    totalValue: '₦1.5B'
  }
];

const specializationOptions = ['All Specializations', 'Road Construction', 'Healthcare Infrastructure', 'Water Infrastructure', 'Marine Infrastructure'];
const statusOptions = ['All Statuses', 'Active', 'Inactive'];

const statusStyles = {
  'Active': 'status-completed',
  'Inactive': 'status-not-started'
};

export default function Contractors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All Specializations');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [showFilters, setShowFilters] = useState(false);

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = specializationFilter === 'All Specializations' || contractor.specialization === specializationFilter;
    const matchesStatus = statusFilter === 'All Statuses' || contractor.status === statusFilter;
    
    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={clsx(
          'h-4 w-4',
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        )}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600">Manage and monitor all contractors working on Abia State projects.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <Link to="/contractors/new" className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add New Contractor</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{contractors.length}</h3>
          <p className="text-sm text-gray-600">Total Contractors</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-600">
            {contractors.filter(c => c.status === 'Active').length}
          </h3>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
            <Award className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-yellow-600">4.4</h3>
          <p className="text-sm text-gray-600">Avg. Rating</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-purple-600">
            {contractors.reduce((sum, c) => sum + c.projects.ongoing, 0)}
          </h3>
          <p className="text-sm text-gray-600">Ongoing Projects</p>
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
              placeholder="Search contractors..."
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
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
              >
                {specializationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contractors Table */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Contractors</h3>
          <p className="text-sm text-gray-600">A comprehensive list of all contractors in the Abia Project Tracker system.</p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Contractor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Specialization</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Contact Person</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Projects</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContractors.map((contractor) => (
                <tr key={contractor.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-mono text-gray-600">{contractor.id}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{contractor.name}</p>
                      <p className="text-xs text-gray-500">{contractor.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{contractor.specialization}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contractor.contact}</p>
                      <p className="text-xs text-gray-500">{contractor.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-900">{contractor.rating}</span>
                      <div className="flex">
                        {renderStars(contractor.rating)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={clsx('status-badge', statusStyles[contractor.status])}>
                      {contractor.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="text-green-600 font-medium">{contractor.projects.completed} completed</p>
                      <p className="text-yellow-600">{contractor.projects.ongoing} ongoing</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/contractors/${contractor.id}`}
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
          {filteredContractors.map((contractor) => (
            <div key={contractor.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{contractor.name}</h4>
                  <p className="text-sm text-gray-500 font-mono">{contractor.id}</p>
                </div>
                <span className={clsx('status-badge', statusStyles[contractor.status])}>
                  {contractor.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="flex items-center text-gray-600">
                  <Building className="h-3 w-3 mr-1" />
                  {contractor.specialization}
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-3 w-3 mr-1" />
                  {contractor.contact}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-3 w-3 mr-1" />
                  {contractor.phone}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  {contractor.location}
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-900">{contractor.rating}</span>
                  <div className="flex">
                    {renderStars(contractor.rating)}
                  </div>
                </div>
                <div className="text-sm text-right">
                  <p className="text-green-600 font-medium">{contractor.projects.completed} completed</p>
                  <p className="text-yellow-600">{contractor.projects.ongoing} ongoing</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Link
                  to={`/contractors/${contractor.id}`}
                  className="text-abia-600 hover:text-abia-700 text-sm font-medium flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredContractors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contractors found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <Link to="/contractors/new" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add New Contractor</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
