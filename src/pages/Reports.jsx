import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import ReportDetailModal from '../components/Reports/ReportDetailModal';

// Mock data for reports
const reports = [
  {
    id: 'RPT-2024-001',
    title: 'Monthly Progress Report - January 2024',
    type: 'Monthly',
    category: 'Progress',
    generatedDate: '2024-01-31',
    generatedBy: 'John Doe',
    status: 'Published',
    projects: 24,
    pages: 45,
    size: '2.3 MB',
    downloads: 156
  },
  {
    id: 'RPT-2024-002',
    title: 'Project Budget Analysis Q4 2023',
    type: 'Quarterly',
    category: 'Financial',
    generatedDate: '2024-01-15',
    generatedBy: 'Sarah Johnson',
    status: 'Published',
    projects: 18,
    pages: 32,
    size: '1.8 MB',
    downloads: 89
  },
  {
    id: 'RPT-2024-003',
    title: 'Contractor Performance Review',
    type: 'Annual',
    category: 'Performance',
    generatedDate: '2024-01-10',
    generatedBy: 'Mike Wilson',
    status: 'Draft',
    projects: 45,
    pages: 78,
    size: '4.1 MB',
    downloads: 23
  },
  {
    id: 'RPT-2024-004',
    title: 'LGA Development Impact Assessment',
    type: 'Special',
    category: 'Impact',
    generatedDate: '2024-01-05',
    generatedBy: 'Jane Smith',
    status: 'Published',
    projects: 67,
    pages: 95,
    size: '5.2 MB',
    downloads: 234
  },
  {
    id: 'RPT-2024-005',
    title: 'Test Industry Ltd - Q1 2024 Performance Report',
    type: 'Quarterly',
    category: 'Performance',
    generatedDate: '2024-01-20',
    generatedBy: 'Test Industry Ltd',
    status: 'Published',
    projects: 12,
    pages: 28,
    size: '1.5 MB',
    downloads: 67
  },
  {
    id: 'RPT-2024-006',
    title: 'Test Industry Ltd - Infrastructure Progress Report',
    type: 'Monthly',
    category: 'Progress',
    generatedDate: '2024-01-15',
    generatedBy: 'Test Industry Ltd',
    status: 'Published',
    projects: 8,
    pages: 22,
    size: '1.2 MB',
    downloads: 43
  },
  {
    id: 'RPT-2024-007',
    title: 'Test Industry Ltd - Safety Compliance Report',
    type: 'Monthly',
    category: 'Safety',
    generatedDate: '2024-01-10',
    generatedBy: 'Test Industry Ltd',
    status: 'Published',
    projects: 15,
    pages: 18,
    size: '0.9 MB',
    downloads: 34
  }
];

const reportTypes = ['All Types', 'Monthly', 'Quarterly', 'Annual', 'Special'];
const categories = ['All Categories', 'Progress', 'Financial', 'Performance', 'Impact'];
const statuses = ['All Status', 'Published', 'Draft', 'In Review'];

const statusStyles = {
  'Published': 'bg-green-100 text-green-800',
  'Draft': 'bg-yellow-100 text-yellow-800',
  'In Review': 'bg-blue-100 text-blue-800'
};

const categoryIcons = {
  'Progress': BarChart3,
  'Financial': TrendingUp,
  'Performance': CheckCircle,
  'Impact': PieChart
};

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All Types' || report.type === typeFilter;
    const matchesCategory = categoryFilter === 'All Categories' || report.category === categoryFilter;
    const matchesStatus = statusFilter === 'All Status' || report.status === statusFilter;
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">M&E Reports</h1>
          <p className="text-gray-600">Generate, manage, and download monitoring & evaluation reports.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export All</span>
          </button>
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{reports.length}</h3>
          <p className="text-sm text-gray-600">Total Reports</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-600">
            {reports.filter(r => r.status === 'Published').length}
          </h3>
          <p className="text-sm text-gray-600">Published</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-yellow-600">
            {reports.filter(r => r.status === 'Draft').length}
          </h3>
          <p className="text-sm text-gray-600">Drafts</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <Download className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-purple-600">
            {reports.reduce((sum, r) => sum + r.downloads, 0)}
          </h3>
          <p className="text-sm text-gray-600">Total Downloads</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
            >
              {reportTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
          <p className="text-sm text-gray-600">All monitoring and evaluation reports generated by the system.</p>
        </div>

        <div className="space-y-4">
          {filteredReports.map((report) => {
            const CategoryIcon = categoryIcons[report.category] || FileText;
            return (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-abia-100 rounded-lg flex items-center justify-center">
                        <CategoryIcon className="h-6 w-6 text-abia-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{report.title}</h4>
                        <span className={clsx('status-badge', statusStyles[report.status])}>
                          {report.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Type:</span> {report.type}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {report.category}
                        </div>
                        <div>
                          <span className="font-medium">Projects:</span> {report.projects}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {report.size}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600">
                          Generated on {new Date(report.generatedDate).toLocaleDateString()} by {report.generatedBy}
                        </div>
                        <div className="text-gray-500">
                          {report.downloads} downloads • {report.pages} pages
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => handleViewReport(report)}
                      className="text-abia-600 hover:text-abia-700 p-2 rounded-lg hover:bg-abia-50"
                      title="View Report Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50"
                      title="Download Report"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <button 
              onClick={() => setShowGenerateModal(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Generate New Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500">
                  <option>Monthly Progress Report</option>
                  <option>Quarterly Budget Analysis</option>
                  <option>Annual Performance Review</option>
                  <option>Special Impact Assessment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date" 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500"
                  />
                  <input 
                    type="date" 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Include Projects
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500">
                  <option>All Projects</option>
                  <option>Active Projects Only</option>
                  <option>Completed Projects Only</option>
                  <option>Delayed Projects Only</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-abia-600 focus:ring-abia-500" />
                  <span className="ml-2 text-sm text-gray-700">Include financial data</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-abia-600 focus:ring-abia-500" />
                  <span className="ml-2 text-sm text-gray-700">Include contractor performance</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 btn-primary"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={handleCloseReportModal}
        />
      )}
    </div>
  );
}
