import { useEffect, useState } from 'react';
import { ArrowRight, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { projectAPI } from '../../services/api';

const statusStyles = {
  'COMPLETED': 'status-completed',
  'IN_PROGRESS': 'status-in-progress',
  'DELAYED': 'status-delayed',
  'NOT_STARTED': 'status-not-started'
};

export default function RecentProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      try {
        const res = await projectAPI.getAll({ limit: 5 });
        if (res?.success && isMounted) {
          setProjects(res.data?.projects || []);
        }
      } catch (e) {
        console.error('Failed to load recent projects:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProjects();
    return () => { isMounted = false; };
  }, []);
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
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-lg">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-lg">No recent projects</div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
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
                      {project.lga}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Budget: ₦{(project.budget || 0).toLocaleString()}
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
                            project.status === 'COMPLETED' ? 'bg-green-500' :
                            project.status === 'DELAYED' ? 'bg-red-500' : 'bg-yellow-500'
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
          ))
        )}
      </div>
    </div>
  );
}
