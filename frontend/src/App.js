import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import Projects from "./components/Projects";
import Tasks from "./components/Tasks";
import TaskDetails from "./components/TaskDetails";
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<Login />} />

        {/* Layout route wrapper for dashboard, projects, tasks */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          {/* Project specific tasks route */}
          <Route path="projects/:id/tasks" element={<Tasks />} />
          {/* Task details route */}
          <Route path="tasks/:taskId" element={<TaskDetails />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
