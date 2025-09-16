import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Contractors from './pages/Contractors';
import ContractorDashboard from './pages/ContractorDashboard';
import MEDashboard from './pages/MEDashboard';
import PublicPortal from './pages/PublicPortal';
import './App.css';

function AppContent() {
  const location = useLocation();
  
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname === '/projects') return 'Projects';
    if (location.pathname.startsWith('/projects/')) return 'Project Details';
    if (location.pathname === '/contractors') return 'Contractors';
    if (location.pathname === '/contractor/dashboard') return 'Contractor Dashboard';
    if (location.pathname === '/me/dashboard') return 'M&E Dashboard';
    if (location.pathname === '/public') return 'Public Portal';
    if (location.pathname === '/reports') return 'M&E Reports';
    if (location.pathname === '/analytics') return 'Analytics';
    if (location.pathname === '/map') return 'Map View';
    if (location.pathname === '/settings') return 'Settings';
    return 'Dashboard';
  };

  // Check if current route is public portal
  const isPublicRoute = location.pathname === '/public';

  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/public" element={<PublicPortal />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:ml-64">
        <Header title={getPageTitle()} />
        
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/contractors" element={<Contractors />} />
            <Route path="/contractor/dashboard" element={<ContractorDashboard />} />
            <Route path="/me/dashboard" element={<MEDashboard />} />
            <Route path="/reports" element={<div className="card"><h2 className="text-xl font-bold">Reports Page Coming Soon</h2></div>} />
            <Route path="/analytics" element={<div className="card"><h2 className="text-xl font-bold">Analytics Page Coming Soon</h2></div>} />
            <Route path="/map" element={<div className="card"><h2 className="text-xl font-bold">Map View Coming Soon</h2></div>} />
            <Route path="/settings" element={<div className="card"><h2 className="text-xl font-bold">Settings Page Coming Soon</h2></div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;