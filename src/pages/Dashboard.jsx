import { 
  FolderOpen, 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import ProjectStatusChart from '../components/Dashboard/ProjectStatusChart';
import RecentProjects from '../components/Dashboard/RecentProjects';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Projects"
          value="324"
          subtitle="+12 from last month"
          icon={FolderOpen}
          trend="up"
          trendValue="+12"
          color="blue"
        />
        <StatsCard
          title="Active Projects"
          value="145"
          subtitle="45% of total projects"
          icon={Activity}
          trend="up"
          trendValue="+4%"
          color="green"
        />
        <StatsCard
          title="Total Budget"
          value="₦1.2B"
          subtitle="₦450M allocated this quarter"
          icon={DollarSign}
          trend="up"
          trendValue="₦150M"
          color="purple"
        />
        <StatsCard
          title="Completion Rate"
          value="78%"
          subtitle="+4% from last month"
          icon={TrendingUp}
          trend="up"
          trendValue="+4%"
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectStatusChart type="bar" />
        <ProjectStatusChart type="pie" />
      </div>

      {/* Recent Projects and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentProjects />
        </div>
        
        {/* Quick Links and Activity */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary flex items-center justify-center space-x-2">
                <FolderOpen className="h-4 w-4" />
                <span>Add New Project</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Review Contractor Updates</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Export Reports</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">John Doe approved a milestone for Aba-Umuahia Expressway</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Sarah Johnson added a new project: Aba Marina Development</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Michael Adebayo flagged an issue with Aba South Water Project</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
