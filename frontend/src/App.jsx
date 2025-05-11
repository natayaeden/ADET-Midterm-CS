import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RiskManagement from './pages/RiskManagement';
import ProjectDetails from './pages/ProjectDetails';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/projects/:projectId/risks" element={<RiskManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/risk-management" element={<RiskManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 