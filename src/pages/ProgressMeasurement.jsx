import { useState } from 'react';
import { 
  BarChart3, 
  Target, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  TrendingUp,
  Award,
  FileText,
  Users,
  Calendar,
  Download,
  Eye,
  Filter
} from 'lucide-react';
import ProgressTracker from '../components/Progress/ProgressTracker';

export default function ProgressMeasurement() {
  const [selectedProject, setSelectedProject] = useState('PRJ-2023-001');
  const [timeframe, setTimeframe] = useState('current');

  // Mock data for demonstration
  const projects = [
    { id: 'PRJ-2023-001', name: 'Aba-Umuahia Expressway Expansion', progress: 65, status: 'In Progress' },
    { id: 'PRJ-2023-002', name: 'Umuahia General Hospital Upgrade', progress: 100, status: 'Completed' },
    { id: 'PRJ-2023-003', name: 'Aba South Water Treatment Plant', progress: 30, status: 'Delayed' },
  ];

  const progressMethodology = [
    {
      title: 'Contractor Updates',
      weight: '20%',
      description: 'Regular progress submissions with photos and documentation',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      criteria: [
        'Weekly progress reports',
        'Milestone completion claims',
        'Photo/video documentation',
        'Quality self-assessments'
      ]
    },
    {
      title: 'Milestone Verification',
      weight: '70%',
      description: 'M&E verified completion of major project milestones',
      icon: Target,
      color: 'bg-green-100 text-green-600',
      criteria: [
        'Site inspection verification',
        'Quality standards compliance',
        'Milestone deliverable review',
        'Technical specification adherence'
      ]
    },
    {
      title: 'Quality Assurance',
      weight: '10%',
      description: 'Overall quality and compliance verification',
      icon: Award,
      color: 'bg-purple-100 text-purple-600',
      criteria: [
        'Safety compliance checks',
        'Environmental standards',
        'Material quality verification',
        'Workmanship assessment'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Measurement System</h1>
          <p className="text-gray-600">Advanced progress tracking based on contractor updates and M&E verification.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500"
          >
            <option value="current">Current Status</option>
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
          </select>
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Project Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Project for Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={clsx(
                'text-left p-4 rounded-lg border-2 transition-colors',
                selectedProject === project.id 
                  ? 'border-abia-300 bg-abia-50' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <h4 className="font-medium text-gray-900 mb-2">{project.name}</h4>
              <div className="flex items-center justify-between">
                <span className={`status-badge ${
                  project.status === 'Completed' ? 'status-completed' :
                  project.status === 'In Progress' ? 'status-in-progress' :
                  'status-delayed'
                }`}>
                  {project.status}
                </span>
                <span className="text-lg font-bold text-gray-900">{project.progress}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Measurement Methodology */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress Measurement Methodology</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {progressMethodology.map((method, index) => {
            const Icon = method.icon;
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{method.title}</h4>
                    <p className="text-sm text-gray-600">Weight: {method.weight}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4">{method.description}</p>
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-900 uppercase tracking-wider">Criteria:</h5>
                  <ul className="space-y-1">
                    {method.criteria.map((criterion, idx) => (
                      <li key={idx} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Tracker Component */}
      <ProgressTracker 
        projectId={selectedProject}
        milestones={[]} // In real app, fetch from API
        submissions={[]} // In real app, fetch from API
        approvals={[]} // In real app, fetch from API
      />

      {/* Progress Verification Workflow */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress Verification Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Contractor Responsibilities</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Submit Regular Updates</h5>
                  <p className="text-sm text-gray-600">Weekly progress reports with photos and metrics</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Milestone Completion</h5>
                  <p className="text-sm text-gray-600">Submit milestone completion with evidence</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Quality Documentation</h5>
                  <p className="text-sm text-gray-600">Provide quality assessments and compliance reports</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">M&E Verification Process</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Review Submissions</h5>
                  <p className="text-sm text-gray-600">Evaluate contractor updates and documentation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Site Inspections</h5>
                  <p className="text-sm text-gray-600">Conduct on-site verification and quality checks</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Approve/Reject</h5>
                  <p className="text-sm text-gray-600">Confirm or reject progress claims with feedback</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
