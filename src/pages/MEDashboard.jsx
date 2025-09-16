import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Camera,
  FileText,
  MapPin,
  Calendar,
  User,
  Download,
  Filter,
  Search,
  MessageSquare,
  Flag,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

// Mock data for M&E dashboard
const pendingApprovals = [
  {
    id: 'SUB-001',
    type: 'milestone',
    title: 'Phase 2: Road Expansion (Km 10-20) - Completion',
    project: 'Lekki-Epe Expressway Expansion',
    projectId: 'PRJ-2023-001',
    contractor: 'Lagos Infrastructure Ltd',
    submittedDate: '2024-01-10',
    submittedBy: 'Adebayo Johnson',
    description: 'Completed 10km section of road expansion with asphalt laying and road markings.',
    progress: 65,
    mediaCount: 15,
    priority: 'High',
    dueDate: '2024-01-15',
    location: 'Eti-Osa LGA',
    estimatedValue: '₦450M'
  },
  {
    id: 'SUB-002',
    type: 'progress',
    title: 'Weekly Progress Update - Week 3',
    project: 'Ikorodu Healthcare Center',
    projectId: 'PRJ-2023-002',
    contractor: 'Medical Facilities Nigeria',
    submittedDate: '2024-01-09',
    submittedBy: 'Sarah Okafor',
    description: 'Foundation work completed, starting structural framework installation.',
    progress: 45,
    mediaCount: 8,
    priority: 'Medium',
    dueDate: '2024-01-12',
    location: 'Ikorodu LGA',
    estimatedValue: '₦85M'
  },
  {
    id: 'SUB-003',
    type: 'issue',
    title: 'Material Shortage Report',
    project: 'Alimosho Water Project',
    projectId: 'PRJ-2023-003',
    contractor: 'Aqua Systems Ltd',
    submittedDate: '2024-01-08',
    submittedBy: 'Michael Ade',
    description: 'Shortage of specialized pipes causing potential 5-day delay.',
    progress: 30,
    mediaCount: 3,
    priority: 'High',
    dueDate: '2024-01-10',
    location: 'Alimosho LGA',
    estimatedValue: '₦0'
  }
];

const recentActivities = [
  {
    id: 1,
    action: 'approved',
    officer: 'John Doe',
    item: 'Phase 1 Milestone - Lekki-Epe Expressway',
    date: '2024-01-09',
    project: 'PRJ-2023-001'
  },
  {
    id: 2,
    action: 'flagged',
    officer: 'Jane Smith',
    item: 'Quality Issue - Ikorodu Healthcare Center',
    date: '2024-01-08',
    project: 'PRJ-2023-002'
  },
  {
    id: 3,
    action: 'reviewed',
    officer: 'Mike Johnson',
    item: 'Progress Update - Surulere Road',
    date: '2024-01-07',
    project: 'PRJ-2023-004'
  }
];

const typeStyles = {
  milestone: 'bg-green-50 text-green-700 border-green-200',
  progress: 'bg-blue-50 text-blue-700 border-blue-200',
  issue: 'bg-red-50 text-red-700 border-red-200'
};

const priorityStyles = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800'
};

const typeIcons = {
  milestone: CheckCircle,
  progress: FileText,
  issue: AlertTriangle
};

export default function MEDashboard() {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterType, setFilterType] = useState('All Types');
  const [filterPriority, setFilterPriority] = useState('All Priorities');

  const handleApprove = (submissionId) => {
    console.log('Approving submission:', submissionId);
    // In real app, this would make an API call
  };

  const handleReject = (submissionId) => {
    console.log('Rejecting submission:', submissionId);
    // In real app, this would make an API call
  };

  const handleFlag = (submissionId) => {
    console.log('Flagging submission:', submissionId);
    // In real app, this would make an API call
  };

  return (
    <div className="space-y-6">
      {/* M&E Officer Welcome */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">M&E Officer Dashboard</h1>
            <p className="text-gray-600 mt-1">Review contractor submissions and monitor project performance</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{pendingApprovals.length}</p>
              <p className="text-sm text-gray-600">Pending Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {pendingApprovals.filter(p => p.priority === 'High').length}
              </p>
              <p className="text-sm text-gray-600">High Priority</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">24</p>
              <p className="text-sm text-gray-600">Approved Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="btn-primary flex items-center justify-center space-x-2 py-4">
          <Eye className="h-5 w-5" />
          <span>Site Inspection</span>
        </button>
        <button className="btn-secondary flex items-center justify-center space-x-2 py-4">
          <FileText className="h-5 w-5" />
          <span>Generate Report</span>
        </button>
        <button className="btn-secondary flex items-center justify-center space-x-2 py-4">
          <Flag className="h-5 w-5" />
          <span>Flag Issues</span>
        </button>
        <button className="btn-secondary flex items-center justify-center space-x-2 py-4">
          <Download className="h-5 w-5" />
          <span>Export Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            <div className="flex space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option>All Types</option>
                <option>Milestone</option>
                <option>Progress</option>
                <option>Issue</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option>All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {pendingApprovals.map((submission) => {
              const Icon = typeIcons[submission.type];
              return (
                <div key={submission.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className={clsx('p-2 rounded-lg border', typeStyles[submission.type])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{submission.title}</h3>
                          <span className={clsx('status-badge', priorityStyles[submission.priority])}>
                            {submission.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{submission.project}</p>
                        <p className="text-sm text-gray-700">{submission.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 mb-4">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {submission.contractor}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {submission.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Due: {new Date(submission.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Camera className="h-3 w-3 mr-1" />
                      {submission.mediaCount} files
                    </div>
                  </div>

                  {submission.type === 'milestone' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress Claimed</span>
                        <span className="font-semibold">{submission.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${submission.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Submitted {new Date(submission.submittedDate).toLocaleDateString()} by {submission.submittedBy}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="text-abia-600 hover:text-abia-700 text-sm font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </button>
                      <button
                        onClick={() => handleApprove(submission.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(submission.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Recent M&E Activity</h3>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={clsx(
                    'flex-shrink-0 w-2 h-2 mt-2 rounded-full',
                    activity.action === 'approved' ? 'bg-green-500' :
                    activity.action === 'flagged' ? 'bg-red-500' : 'bg-blue-500'
                  )} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.officer}</span> {activity.action} 
                      <span className="font-medium"> {activity.item}</span>
                    </p>
                    <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">This Week's Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reviews Completed</span>
                <span className="font-semibold text-gray-900">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Approvals Given</span>
                <span className="font-semibold text-green-600">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Issues Flagged</span>
                <span className="font-semibold text-red-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Site Visits</span>
                <span className="font-semibold text-blue-600">8</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">System Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Projects</span>
                <span className="font-semibold text-gray-900">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">On Schedule</span>
                <span className="font-semibold text-green-600">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Delayed</span>
                <span className="font-semibold text-red-600">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">At Risk</span>
                <span className="font-semibold text-yellow-600">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Review Submission</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Submission Details</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Project:</span>
                    <p className="font-medium">{selectedSubmission.project}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Contractor:</span>
                    <p className="font-medium">{selectedSubmission.contractor}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Submitted by:</span>
                    <p className="font-medium">{selectedSubmission.submittedBy}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Description:</span>
                    <p className="text-gray-900">{selectedSubmission.description}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Estimated Value:</span>
                    <p className="font-medium">{selectedSubmission.estimatedValue}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">M&E Review</h4>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    rows="4"
                    placeholder="Add your review comments..."
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Media & Documents</h4>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[...Array(selectedSubmission.mediaCount)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button className="w-full btn-primary flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve Submission</span>
                  </button>
                  <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                    <Flag className="h-4 w-4" />
                    <span>Request Clarification</span>
                  </button>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center space-x-2">
                    <XCircle className="h-4 w-4" />
                    <span>Reject Submission</span>
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
