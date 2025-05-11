import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../Login';
import Dashboard from '../Dashboard';
import Projects from '../Projects';
import Tasks from '../Tasks';
import TaskDetails from '../TaskDetails';
import RiskManagement from '../projects/RiskManagement';
import IssueManagement from '../projects/IssueManagement';
import ProjectReports from '../projects/ProjectReports';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:projectId/tasks" element={<Tasks />} />
      <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetails />} />
      <Route path="/projects/:projectId/risks" element={<RiskManagement />} />
      <Route path="/projects/:projectId/issues" element={<IssueManagement />} />
      <Route path="/projects/:projectId/reports" element={<ProjectReports />} />
    </Routes>
  );
};

export default AppRoutes; 