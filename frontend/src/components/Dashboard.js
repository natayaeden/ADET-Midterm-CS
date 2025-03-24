import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Dashboard.css";

const Dashboard = () => {
  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="container-fluid">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark w-100">
        <span className="navbar-brand fw-bold">Project Management System</span>
        <button className="btn btn-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="container mt-4">
        <h2 className="text-center fw-bold">Welcome to the Dashboard</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card shadow-sm p-3 text-center">
              <h5><i className="bi bi-folder-check me-2"></i>Project Management</h5>
              <p>Create and manage projects.</p>
              <button className="btn btn-primary w-100">View Projects</button>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm p-3 text-center">
              <h5><i className="bi bi-list-task me-2"></i>Task Assignment</h5>
              <p>Assign and monitor tasks.</p>
              <button className="btn btn-primary w-100">Manage Tasks</button>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm p-3 text-center">
              <h5><i className="bi bi-wallet2 me-2"></i>Budget Monitoring</h5>
              <p>Track financials and project budgets.</p>
              <button className="btn btn-primary w-100">View Budget</button>
            </div>
          </div>
        </div>

        <div className="row g-4 mt-1">
          <div className="col-md-6">
            <div className="card shadow-sm p-3 text-center">
              <h5><i className="bi bi-chat-dots me-2"></i>Team Communication</h5>
              <p>Chat and collaborate with team members.</p>
              <button className="btn btn-primary w-100">Open Chat</button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm p-3 text-center">
              <h5><i className="bi bi-bar-chart me-2"></i>Reports</h5>
              <p>Generate reports and insights.</p>
              <button className="btn btn-primary w-100">View Reports</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
