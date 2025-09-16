import { useState } from 'react';
import { 
  Upload, 
  Camera, 
  FileText, 
  Calendar, 
  MapPin, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

// Mock data for contractor's projects
const contractorProjects = [
  {
    id: 'PRJ-2023-001',
    name: 'Lekki-Epe Expressway Expansion',
    lga: 'Eti-Osa',
    budget: '₦1.2B',
    progress: 65,
    status: 'In Progress',
    dueDate: '2024-06-30',
    nextMilestone: 'Phase 2: Road Expansion (Km 10-20)',
    milestoneProgress: 65,
    lastUpdate: '2 days ago',
    pendingApprovals: 1,
    totalMilestones: 3,
    completedMilestones: 1
  },
  {
    id: 'PRJ-2023-005',
    name: 'Ikorodu Road Rehabilitation',
    lga: 'Ikorodu',
    budget: '₦850M',
    progress: 40,
    status: 'In Progress',
    dueDate: '2024-08-15',
    nextMilestone: 'Phase 1: Surface Preparation',
    milestoneProgress: 40,
    lastUpdate: '1 week ago',
    pendingApprovals: 0,
    totalMilestones: 4,
    completedMilestones: 0
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'milestone',
    title: 'Phase 2 Milestone Submitted',
    project: 'Lekki-Epe Expressway Expansion',
    description: 'Submitted milestone completion with 15 progress photos',
    date: '2024-01-10',
    status: 'Pending Approval'
  },
  {
    id: 2,
    type: 'update',
    title: 'Progress Update Uploaded',
    project: 'Ikorodu Road Rehabilitation',
    description: 'Weekly progress report with site photos uploaded',
    date: '2024-01-08',
    status: 'Approved'
  },
  {
    id: 3,
    type: 'issue',
    title: 'Weather Delay Reported',
    project: 'Lekki-Epe Expressway Expansion',
    description: 'Reported 3-day delay due to heavy rainfall',
    date: '2024-01-05',
    status: 'Acknowledged'
  }
];

const statusStyles = {
  'Completed': 'status-completed',
  'In Progress': 'status-in-progress',
  'Delayed': 'status-delayed',
  'Not Started': 'status-not-started'
};

const activityIcons = {
  milestone: CheckCircle,
  update: FileText,
  issue: AlertTriangle
};

const activityColors = {
  milestone: 'text-green-600 bg-green-50',
  update: 'text-blue-600 bg-blue-50',
  issue: 'text-red-600 bg-red-50'
};

export default function ContractorDashboard() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Lagos Infrastructure Ltd</h1>
            <p className="text-gray-600 mt-1">Contractor Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-abia-600">{contractorProjects.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-yellow-600">
                {contractorProjects.reduce((sum, p) => sum + p.pendingApprovals, 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">78%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center justify-center space-x-2 py-4"
        >
          <Upload className="h-5 w-5" />
          <span>Submit Update</span>
        </button>
        <button className="btn-secondary flex items-center justify-center space-x-2 py-4">
          <Camera className="h-5 w-5" />
          <span>Upload Photos</span>
        </button>
        <button className="btn-secondary flex items-center justify-center space-x-2 py-4">
          <FileText className="h-5 w-5" />
          <span>Submit Report</span>
        </button>
        <button className="btn-secondary flex items-center justify-center space-x-2 py-4">
          <MessageSquare className="h-5 w-5" />
          <span>Contact M&E</span>
        </button>
      </div>

      {/* Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
          
          {contractorProjects.map((project) => (
            <div key={project.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{project.id}</p>
                </div>
                <span className={clsx('status-badge', statusStyles[project.status])}>
                  {project.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {project.lga}
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {project.budget}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Due: {new Date(project.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Updated: {project.lastUpdate}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-abia-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">Next Milestone</span>
                  <span className="text-gray-600">{project.milestoneProgress}%</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{project.nextMilestone}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-yellow-500 h-1.5 rounded-full"
                    style={{ width: `${project.milestoneProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{project.completedMilestones}/{project.totalMilestones} milestones</span>
                  {project.pendingApprovals > 0 && (
                    <span className="text-yellow-600 font-medium">
                      {project.pendingApprovals} pending approval
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/contractor/projects/${project.id}`}
                    className="text-abia-600 hover:text-abia-700 text-sm font-medium flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          
          <div className="card">
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activityIcons[activity.type];
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={clsx('p-2 rounded-lg flex-shrink-0', activityColors[activity.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{activity.project}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <div className="mt-2">
                        <span className={clsx(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          activity.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          activity.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        )}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link 
                to="/contractor/activity" 
                className="text-abia-600 hover:text-abia-700 text-sm font-medium"
              >
                View All Activity →
              </Link>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Phase 2 Milestone</p>
                  <p className="text-xs text-gray-600">Lekki-Epe Expressway</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-yellow-700">15 days</p>
                  <p className="text-xs text-gray-600">remaining</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Monthly Report</p>
                  <p className="text-xs text-gray-600">All Projects</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-700">3 days</p>
                  <p className="text-xs text-gray-600">overdue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Project Update</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Project
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500">
                  {contractorProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Type
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500">
                  <option value="progress">Progress Update</option>
                  <option value="milestone">Milestone Completion</option>
                  <option value="issue">Report Issue</option>
                  <option value="general">General Update</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500"
                  rows="3"
                  placeholder="Describe the update..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Photos/Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="flex-1 btn-primary"
              >
                Submit Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
