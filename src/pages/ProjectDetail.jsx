import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail,
  Camera,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Download,
  Upload,
  MessageSquare
} from 'lucide-react';
import clsx from 'clsx';

// Mock project data - in a real app, this would come from an API
const projectData = {
  'PRJ-2023-001': {
    id: 'PRJ-2023-001',
    name: 'Lekki-Epe Expressway Expansion',
    description: 'Expansion of the Lekki-Epe Expressway from 4 to 8 lanes including drainage systems and street lighting infrastructure.',
    lga: 'Eti-Osa',
    contractor: {
      name: 'Lagos Infrastructure Ltd',
      contact: 'Adebayo Johnson',
      phone: '+234 801 234 5678',
      email: 'info@lagosinfra.com',
      rating: 4.8
    },
    budget: {
      total: '₦1,200,000,000',
      allocated: '₦780,000,000',
      spent: '₦507,000,000'
    },
    timeline: {
      start: '2023-01-15',
      end: '2024-06-30',
      duration: '17 months'
    },
    status: 'In Progress',
    progress: 65,
    location: {
      coordinates: '6.4281, 3.4219',
      address: 'Lekki-Epe Expressway, Eti-Osa LGA, Lagos State'
    },
    milestones: [
      {
        id: 1,
        title: 'Phase 1: Road Expansion (Km 0-10)',
        status: 'Completed',
        progress: 100,
        dueDate: '2023-06-30',
        completedDate: '2023-06-28',
        description: 'Completed expansion of first 10km section'
      },
      {
        id: 2,
        title: 'Phase 2: Road Expansion (Km 10-20)',
        status: 'In Progress',
        progress: 65,
        dueDate: '2024-02-28',
        description: 'Currently working on second 10km section'
      },
      {
        id: 3,
        title: 'Phase 3: Drainage & Lighting Installation',
        status: 'Not Started',
        progress: 0,
        dueDate: '2024-06-30',
        description: 'Installation of drainage systems and street lighting'
      }
    ],
    updates: [
      {
        id: 1,
        date: '2024-01-10',
        type: 'progress',
        title: 'Phase 2 Progress Update',
        description: 'Completed 65% of Phase 2 road expansion. Installation of asphalt layer in progress.',
        author: 'Lagos Infrastructure Ltd',
        media: ['progress-photo-1.jpg', 'progress-photo-2.jpg']
      },
      {
        id: 2,
        date: '2024-01-08',
        type: 'issue',
        title: 'Weather Delay',
        description: 'Heavy rainfall has caused a 3-day delay in construction activities.',
        author: 'M&E Officer',
        status: 'Resolved'
      },
      {
        id: 3,
        date: '2024-01-05',
        type: 'milestone',
        title: 'Phase 2 Milestone Approved',
        description: 'M&E team has approved the completion of Phase 2 foundation work.',
        author: 'John Doe - M&E Officer'
      }
    ]
  }
};

const statusStyles = {
  'Completed': 'status-completed',
  'In Progress': 'status-in-progress',
  'Delayed': 'status-delayed',
  'Not Started': 'status-not-started'
};

const updateTypeIcons = {
  progress: Camera,
  issue: AlertTriangle,
  milestone: CheckCircle,
  general: MessageSquare
};

const updateTypeColors = {
  progress: 'text-blue-600 bg-blue-50',
  issue: 'text-red-600 bg-red-50',
  milestone: 'text-green-600 bg-green-50',
  general: 'text-gray-600 bg-gray-50'
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const project = projectData[id];

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Project not found</h2>
        <p className="text-gray-600 mt-2">The project you're looking for doesn't exist.</p>
        <Link to="/projects" className="btn-primary mt-4">Back to Projects</Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'milestones', name: 'Milestones' },
    { id: 'updates', name: 'Updates' },
    { id: 'documents', name: 'Documents' },
    { id: 'team', name: 'Team' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/projects" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.id}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Edit Project</span>
          </button>
        </div>
      </div>

      {/* Project Status Card */}
      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Project Status</h2>
              <span className={clsx('status-badge', statusStyles[project.status])}>
                {project.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{project.lga}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="font-medium">{project.timeline.duration}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-medium">{project.budget.total}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Progress</span>
                <span className="text-lg font-bold text-gray-900">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-abia-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="border-l border-gray-200 pl-6">
            <h3 className="font-medium text-gray-900 mb-4">Contractor</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{project.contractor.name}</p>
                <p className="text-sm text-gray-600">Contact: {project.contractor.contact}</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{project.contractor.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{project.contractor.email}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">Rating:</span>
                <span className="font-medium text-yellow-600">{project.contractor.rating} ⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-abia-500 text-abia-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Description */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
              <p className="text-gray-600 leading-relaxed">{project.description}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium">{new Date(project.timeline.start).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium">{new Date(project.timeline.end).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Budget</span>
                  <span className="font-semibold text-gray-900">{project.budget.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Allocated</span>
                  <span className="font-medium text-blue-600">{project.budget.allocated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Spent</span>
                  <span className="font-medium text-green-600">{project.budget.spent}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Remaining</span>
                    <span className="font-semibold text-gray-900">₦273,000,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Milestones</h3>
            <div className="space-y-6">
              {project.milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative">
                  {index !== project.milestones.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200" />
                  )}
                  <div className="flex items-start space-x-4">
                    <div className={clsx(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      milestone.status === 'Completed' ? 'bg-green-100 text-green-600' :
                      milestone.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-400'
                    )}>
                      {milestone.status === 'Completed' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : milestone.status === 'In Progress' ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-current" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                        <span className={clsx('status-badge', statusStyles[milestone.status])}>
                          {milestone.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                        {milestone.completedDate && (
                          <span>Completed: {new Date(milestone.completedDate).toLocaleDateString()}</span>
                        )}
                        <span>Progress: {milestone.progress}%</span>
                      </div>
                      {milestone.progress > 0 && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={clsx(
                              'h-2 rounded-full',
                              milestone.status === 'Completed' ? 'bg-green-500' :
                              milestone.status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-400'
                            )}
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Project Updates</h3>
              <button className="btn-primary flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Submit Update</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {project.updates.map((update) => {
                const Icon = updateTypeIcons[update.type];
                return (
                  <div key={update.id} className="card">
                    <div className="flex items-start space-x-4">
                      <div className={clsx('p-2 rounded-lg', updateTypeColors[update.type])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{update.title}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(update.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{update.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm text-gray-500">By: {update.author}</span>
                          {update.media && update.media.length > 0 && (
                            <div className="flex items-center space-x-1 text-sm text-abia-600">
                              <Camera className="h-4 w-4" />
                              <span>{update.media.length} photos</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(activeTab === 'documents' || activeTab === 'team') && (
          <div className="card text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'documents' ? 'Documents' : 'Team'} Coming Soon
            </h3>
            <p className="text-gray-600">
              This section is under development and will be available soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
