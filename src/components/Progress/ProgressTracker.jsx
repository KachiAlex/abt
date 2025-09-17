import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Eye,
  RefreshCw,
  BarChart3,
  Calendar,
  FileText,
  Shield
} from 'lucide-react';
import clsx from 'clsx';

export default function ProgressTracker({ projectId, milestones, submissions, approvals }) {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    calculateProgress();
  }, [projectId, milestones, submissions, approvals]);

  const calculateProgress = () => {
    setLoading(true);
    
    // Simulate progress calculation (in real app, this would call the service)
    setTimeout(() => {
      const mockProgressData = {
        overallProgress: 65,
        milestoneProgress: 70,
        physicalProgress: 60,
        verifiedProgress: 85,
        confidence: 'HIGH',
        lastUpdate: new Date(),
        breakdown: {
          milestones: {
            total: 5,
            completed: 3,
            pending: 1,
            delayed: 1
          },
          submissions: {
            total: 12,
            approved: 10,
            pending: 1,
            rejected: 1
          },
          verifications: {
            qualityScore: 4.2,
            timelineAdherence: 78,
            approvalRate: 83
          }
        },
        trends: {
          thisMonth: 65,
          lastMonth: 58,
          change: +7
        }
      };
      
      setProgressData(mockProgressData);
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mr-2" />
          <span className="text-gray-600">Calculating progress...</span>
        </div>
      </div>
    );
  }

  if (!progressData) return null;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Progress Measurement</h3>
          <div className="flex items-center space-x-2">
            <span className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium',
              progressData.confidence === 'HIGH' ? 'bg-green-100 text-green-800' :
              progressData.confidence === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            )}>
              {progressData.confidence} Confidence
            </span>
            <button 
              onClick={calculateProgress}
              className="text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Progress Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressData.overallProgress / 100)}`}
                  className="text-abia-600 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{progressData.overallProgress}%</span>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900">Overall Progress</h4>
            <div className="flex items-center justify-center space-x-1 mt-1">
              {progressData.trends.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={clsx(
                'text-sm font-medium',
                progressData.trends.change > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {progressData.trends.change > 0 ? '+' : ''}{progressData.trends.change}% this month
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Milestone Progress</h4>
            <p className="text-2xl font-bold text-blue-600">{progressData.milestoneProgress}%</p>
            <p className="text-sm text-gray-600">{progressData.breakdown.milestones.completed}/{progressData.breakdown.milestones.total} completed</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Physical Progress</h4>
            <p className="text-2xl font-bold text-green-600">{progressData.physicalProgress}%</p>
            <p className="text-sm text-gray-600">Contractor reported</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">M&E Verified</h4>
            <p className="text-2xl font-bold text-purple-600">{progressData.verifiedProgress}%</p>
            <p className="text-sm text-gray-600">Quality verified</p>
          </div>
        </div>

        {/* Progress Breakdown */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Progress Calculation Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Milestone Completion</span>
                <span className="text-sm text-blue-700">70% weight</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${progressData.milestoneProgress}%` }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-1">{progressData.milestoneProgress}% of milestones completed</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">Physical Progress</span>
                <span className="text-sm text-green-700">20% weight</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${progressData.physicalProgress}%` }}
                />
              </div>
              <p className="text-xs text-green-700 mt-1">Latest contractor update</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Quality Verification</span>
                <span className="text-sm text-purple-700">10% weight</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${progressData.verifiedProgress}%` }}
                />
              </div>
              <p className="text-xs text-purple-700 mt-1">M&E approval rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Status */}
        <div className="card">
          <h4 className="font-semibold text-gray-900 mb-4">Submission Status</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Submissions</span>
              <span className="font-semibold">{progressData.breakdown.submissions.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approved by M&E</span>
              <span className="font-semibold text-green-600">{progressData.breakdown.submissions.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Review</span>
              <span className="font-semibold text-yellow-600">{progressData.breakdown.submissions.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rejected</span>
              <span className="font-semibold text-red-600">{progressData.breakdown.submissions.rejected}</span>
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="card">
          <h4 className="font-semibold text-gray-900 mb-4">Quality Metrics</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quality Score</span>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{progressData.breakdown.verifications.qualityScore}/5.0</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Timeline Adherence</span>
              <span className="font-semibold">{progressData.breakdown.verifications.timelineAdherence}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approval Rate</span>
              <span className="font-semibold">{progressData.breakdown.verifications.approvalRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="font-semibold">{progressData.lastUpdate?.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Formula Explanation */}
      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-4">How Progress is Measured</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 font-bold text-xs">1</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Contractor Submissions</h5>
                <p className="text-sm text-gray-600">
                  Contractors submit progress updates, milestone completions, and quality reports with photos and documentation.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 font-bold text-xs">2</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">M&E Verification</h5>
                <p className="text-sm text-gray-600">
                  M&E officers review submissions, conduct site inspections, and approve or reject progress claims.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-purple-600 font-bold text-xs">3</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Weighted Calculation</h5>
                <p className="text-sm text-gray-600">
                  Overall progress = (Milestone Completion × 70%) + (Physical Progress × 20%) + (Quality Verification × 10%)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900">Confidence Level: {progressData.confidence}</h5>
              <p className="text-sm text-blue-700">
                Based on submission frequency, approval rates, and recent activity. 
                {progressData.confidence === 'HIGH' ? ' Regular updates with high approval rates.' :
                 progressData.confidence === 'MEDIUM' ? ' Moderate activity with some concerns.' :
                 ' Limited data or low approval rates - requires attention.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-6">Milestone Progress Timeline</h4>
        <div className="space-y-4">
          {[
            { name: 'Project Initiation', status: 'completed', date: '2023-01-15', weight: '5%' },
            { name: 'Design Approval', status: 'completed', date: '2023-02-28', weight: '10%' },
            { name: 'Foundation Work', status: 'completed', date: '2023-05-15', weight: '20%' },
            { name: 'Structural Work', status: 'in-progress', date: '2024-01-30', weight: '30%' },
            { name: 'Finishing Work', status: 'pending', date: '2024-04-15', weight: '25%' },
            { name: 'Final Inspection', status: 'pending', date: '2024-06-30', weight: '10%' }
          ].map((milestone, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center',
                milestone.status === 'completed' ? 'bg-green-500 text-white' :
                milestone.status === 'in-progress' ? 'bg-yellow-500 text-white' :
                'bg-gray-200 text-gray-500'
              )}>
                {milestone.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : milestone.status === 'in-progress' ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900">{milestone.name}</h5>
                  <span className="text-xs text-gray-500">{milestone.weight} of project</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={clsx(
                    'text-sm',
                    milestone.status === 'completed' ? 'text-green-600' :
                    milestone.status === 'in-progress' ? 'text-yellow-600' :
                    'text-gray-500'
                  )}>
                    {milestone.status === 'completed' ? 'Completed & Verified' :
                     milestone.status === 'in-progress' ? 'In Progress' :
                     'Pending'}
                  </span>
                  <span className="text-sm text-gray-500">{milestone.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
