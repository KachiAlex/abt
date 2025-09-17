import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectNew from './pages/ProjectNew';
import Contractors from './pages/Contractors';
import ContractorDashboard from './pages/ContractorDashboard';
import MEDashboard from './pages/MEDashboard';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import MapView from './pages/MapView';
import Settings from './pages/Settings';
import PublicPortal from './pages/PublicPortal';
import './App.css';

function AppContent() {
  const location = useLocation();
  
  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Dashboard';
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

  // Check if current route is home, public portal, or other standalone pages
  const isStandaloneRoute = location.pathname === '/' || location.pathname === '/public';

  if (isStandaloneRoute) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<ProjectNew />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/contractors" element={<Contractors />} />
            <Route path="/contractor/dashboard" element={<ContractorDashboard />} />
            <Route path="/me/dashboard" element={<MEDashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/settings" element={<Settings />} />
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