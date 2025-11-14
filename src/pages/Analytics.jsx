import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

// Mock data for analytics
const projectStatusData = [
  { name: 'Jan', completed: 12, inProgress: 8, delayed: 3 },
  { name: 'Feb', completed: 15, inProgress: 10, delayed: 2 },
  { name: 'Mar', completed: 18, inProgress: 12, delayed: 4 },
  { name: 'Apr', completed: 22, inProgress: 15, delayed: 3 },
  { name: 'May', completed: 25, inProgress: 18, delayed: 5 },
  { name: 'Jun', completed: 28, inProgress: 20, delayed: 4 }
];

const budgetData = [
  { month: 'Jan', allocated: 2.5, spent: 2.1, remaining: 0.4 },
  { month: 'Feb', allocated: 3.2, spent: 2.8, remaining: 0.4 },
  { month: 'Mar', allocated: 2.8, spent: 2.5, remaining: 0.3 },
  { month: 'Apr', allocated: 3.5, spent: 3.1, remaining: 0.4 },
  { month: 'May', allocated: 4.1, spent: 3.7, remaining: 0.4 },
  { month: 'Jun', allocated: 3.8, spent: 3.4, remaining: 0.4 }
];

const lgaPerformanceData = [
  { name: 'Aba North', projects: 15, completion: 78, budget: 2.5 },
  { name: 'Aba South', projects: 12, completion: 85, budget: 2.1 },
  { name: 'Arochukwu', projects: 8, completion: 65, budget: 1.8 },
  { name: 'Bende', projects: 10, completion: 72, budget: 1.9 },
  { name: 'Ikwuano', projects: 6, completion: 90, budget: 1.2 },
  { name: 'Isiala Ngwa North', projects: 14, completion: 68, budget: 2.3 },
  { name: 'Isiala Ngwa South', projects: 11, completion: 75, budget: 2.0 },
  { name: 'Isuikwuato', projects: 7, completion: 82, budget: 1.5 }
];

const contractorPerformanceData = [
  { name: 'Excellent', value: 12, color: '#10b981' },
  { name: 'Good', value: 18, color: '#3b82f6' },
  { name: 'Average', value: 8, color: '#f59e0b' },
  { name: 'Poor', value: 3, color: '#ef4444' }
];

const timeSeriesData = [
  { date: '2023-07', projects: 45, budget: 15.2 },
  { date: '2023-08', projects: 48, budget: 16.8 },
  { date: '2023-09', projects: 52, budget: 18.1 },
  { date: '2023-10', projects: 55, budget: 19.5 },
  { date: '2023-11', projects: 58, budget: 20.8 },
  { date: '2023-12', projects: 62, budget: 22.1 },
  { date: '2024-01', projects: 65, budget: 23.4 }
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('6M');
  const [selectedMetric, setSelectedMetric] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600">Advanced analytics and performance insights for project tracking.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500"
          >
            <option value="1M">Last Month</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="1Y">Last Year</option>
          </select>
          <button className="btn-secondary flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Project Success Rate</p>
              <p className="text-2xl font-bold text-green-600">84.2%</p>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+5.2% from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Budget Efficiency</p>
              <p className="text-2xl font-bold text-blue-600">91.5%</p>
              <div className="flex items-center text-sm text-blue-600 mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+2.1% from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Completion Time</p>
              <p className="text-2xl font-bold text-purple-600">8.3 months</p>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span>-0.7 months improved</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Risk Projects</p>
              <p className="text-2xl font-bold text-red-600">7</p>
              <div className="flex items-center text-sm text-red-600 mt-1">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Requires attention</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Trends */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Project Status Trends</h3>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span>Delayed</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" stackId="a" fill="#10b981" />
              <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" />
              <Bar dataKey="delayed" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Analysis */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Budget Analysis (₦B)</h3>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-abia-500 rounded-full mr-1"></div>
                <span>Allocated</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Spent</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="allocated" stroke="#059669" strokeWidth={2} />
              <Line type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contractor Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Contractor Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={contractorPerformanceData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {contractorPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Trends */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Growth Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="projects" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LGA Performance Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">LGA Performance Overview</h3>
          <button className="btn-secondary flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">LGA</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Active Projects</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Completion Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Budget (₦B)</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
              </tr>
            </thead>
            <tbody>
              {lgaPerformanceData.map((lga) => (
                <tr key={lga.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">{lga.name}</td>
                  <td className="py-4 px-4 text-gray-600">{lga.projects}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px] mr-3">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${lga.completion}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{lga.completion}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">₦{lga.budget}B</td>
                  <td className="py-4 px-4">
                    <span className={`status-badge ${
                      lga.completion >= 80 ? 'status-completed' :
                      lga.completion >= 70 ? 'status-in-progress' : 'status-delayed'
                    }`}>
                      {lga.completion >= 80 ? 'Excellent' :
                       lga.completion >= 70 ? 'Good' : 'Needs Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">Project completion rate improved by 12% this quarter</p>
            </div>
            <div className="flex items-start space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-gray-700">Budget efficiency increased across all LGAs</p>
            </div>
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-gray-700">3 LGAs show declining performance trends</p>
            </div>
            <div className="flex items-start space-x-2">
              <Users className="h-4 w-4 text-purple-600 mt-0.5" />
              <p className="text-sm text-gray-700">Top 5 contractors maintain excellent ratings</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Focus on Delayed Projects</p>
              <p className="text-sm text-blue-700">7 projects require immediate attention to prevent further delays</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-900">Optimize Resource Allocation</p>
              <p className="text-sm text-green-700">Reallocate resources from over-performing to struggling LGAs</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-900">Contractor Training</p>
              <p className="text-sm text-yellow-700">Provide additional support to underperforming contractors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
