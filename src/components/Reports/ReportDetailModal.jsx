import { X, FileText, Calendar, User, MapPin, TrendingUp, Shield, AlertTriangle, CheckCircle, Download, Eye, Star, Clock } from 'lucide-react';

export default function ReportDetailModal({ report, isOpen, onClose }) {
  if (!isOpen || !report) return null;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getTypeColor = (type) => {
    const colors = {
      milestone: 'bg-green-50 text-green-700 border-green-200',
      progress: 'bg-blue-50 text-blue-700 border-blue-200',
      issue: 'bg-red-50 text-red-700 border-red-200',
      safety: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      milestone: CheckCircle,
      progress: FileText,
      issue: AlertTriangle,
      safety: Shield
    };
    return icons[type] || FileText;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getComplianceColor = (compliance) => {
    const colors = {
      'Outstanding': 'text-green-600 bg-green-50',
      'Excellent': 'text-blue-600 bg-blue-50',
      'Good': 'text-yellow-600 bg-yellow-50',
      'Fair': 'text-orange-600 bg-orange-50',
      'Poor': 'text-red-600 bg-red-50'
    };
    return colors[compliance] || 'text-gray-600 bg-gray-50';
  };

  const TypeIcon = getTypeIcon(report.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getTypeColor(report.type)}`}>
                <TypeIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500 font-mono">{report.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                    {report.priority} Priority
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Report Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Report Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{report.description}</p>
                </div>
              </div>

              {/* Project Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Information</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Project Name</p>
                      <p className="text-sm text-blue-700">{report.project}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Project ID</p>
                      <p className="text-sm text-blue-700 font-mono">{report.projectId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Contractor</p>
                      <p className="text-sm text-blue-700">{report.contractor}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Location</p>
                      <p className="text-sm text-blue-700">{report.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress and Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress & Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{report.progress}%</div>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${report.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">Quality Score</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-2xl font-bold text-yellow-600">{report.qualityScore}</span>
                      <div className="flex">
                        {renderStars(report.qualityScore)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Safety</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(report.safetyCompliance)}`}>
                      {report.safetyCompliance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Media Attachments */}
              {report.mediaCount > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{report.mediaCount} files attached</p>
                          <p className="text-xs text-gray-500">Photos, documents, and reports</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 bg-white rounded-lg border">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 bg-white rounded-lg border">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Report Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Report Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Submitted Date</p>
                      <p className="text-sm text-gray-600">{formatDate(report.submittedDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Due Date</p>
                      <p className="text-sm text-gray-600">{formatDate(report.dueDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Submitted By</p>
                      <p className="text-sm text-gray-600">{report.submittedBy}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{report.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              {report.estimatedValue !== '₦0' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Information</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Estimated Value</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{report.estimatedValue}</div>
                  </div>
                </div>
              )}

              {/* Weather Impact */}
              {report.weatherImpact && report.weatherImpact !== 'None' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Weather Impact</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">{report.weatherImpact}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Approve Report
                  </button>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Request Changes
                  </button>
                  <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                    Reject Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Report ID: {report.id} • Submitted: {formatDate(report.submittedDate)}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
