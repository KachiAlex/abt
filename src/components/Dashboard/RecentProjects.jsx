import { ArrowRight, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const projects = [
  {
    id: 'PRJ-2023-001',
    name: 'Aba-Umuahia Expressway Expansion',
    location: 'Aba North',
    budget: '₦1.2B',
    progress: 65,
    status: 'In Progress',
    lastUpdate: '2 days ago',
    contractor: 'Abia Infrastructure Ltd'
  },
  {
    id: 'PRJ-2023-002',
    name: 'Umuahia General Hospital Upgrade',
    location: 'Umuahia North',
    budget: '₦450M',
    progress: 100,
    status: 'Completed',
    lastUpdate: '1 week ago',
    contractor: 'Medical Facilities Nigeria'
  },
  {
    id: 'PRJ-2023-003',
    name: 'Aba South Water Treatment Plant',
    location: 'Aba South',
    budget: '₦780M',
    progress: 30,
    status: 'Delayed',
    lastUpdate: '3 days ago',
    contractor: 'Aqua Systems Ltd'
  },
  {
    id: 'PRJ-2023-004',
    name: 'Arochukwu Road Rehabilitation',
    location: 'Arochukwu',
    budget: '₦650M',
    progress: 45,
    status: 'In Progress',
    lastUpdate: 'Yesterday',
    contractor: 'Road Masters Nigeria'
  },
];

const statusStyles = {
  'Completed': 'status-completed',
  'In Progress': 'status-in-progress',
  'Delayed': 'status-delayed',
  'Not Started': 'status-not-started'
};

export default function RecentProjects() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
          <p className="text-sm text-gray-600">Latest updates from projects across Abia State</p>
        </div>
        <Link 
          to="/projects" 
          className="flex items-center text-sm text-abia-600 hover:text-abia-700 font-medium"
        >
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">{project.name}</h4>
                  <span className={clsx('status-badge', statusStyles[project.status])}>
                    {project.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {project.location}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Budget: {project.budget}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Updated: {project.lastUpdate}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={clsx(
                          'h-2 rounded-full transition-all duration-300',
                          project.status === 'Completed' ? 'bg-green-500' :
                          project.status === 'Delayed' ? 'bg-red-500' : 'bg-yellow-500'
                        )}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-xs text-abia-600 hover:text-abia-700 font-medium flex items-center"
                  >
                    View
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
