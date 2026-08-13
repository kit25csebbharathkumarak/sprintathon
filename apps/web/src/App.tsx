import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import EnterpriseLogin from './pages/EnterpriseLogin';
import EnterpriseRegister from './pages/EnterpriseRegister';
import Workspace from './pages/Workspace';
import SuperAdminPortal from './SuperAdminPortal';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const isSuperAdmin = localStorage.getItem('superAdmin') === 'true';
  return isSuperAdmin ? <>{children}</> : <Navigate to="/admin/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedAdminRoute>
              <SuperAdminPortal onLogout={() => {
                localStorage.removeItem('superAdmin');
                window.location.href = '/';
              }} />
            </ProtectedAdminRoute>
          } 
        />

        <Route path="/enterprise/login" element={<EnterpriseLogin />} />
        <Route path="/enterprise/register" element={<EnterpriseRegister />} />
        <Route path="/enterprise/dashboard" element={<Workspace />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
