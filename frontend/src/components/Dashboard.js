import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../componentStyles/Dashboard.css';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const notificationRef = useRef(null);

  const handleLogout = () => {
    window.location.href = "/";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleNotification = () => {
    setShowNotification(!showNotification);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotification(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <span className="sidebar-brand">Klick Inc.</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active">
              <a href="#dashboard">
                <i className="bi bi-grid"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/projects">
                <i className="bi bi-folder"></i>
                <span>Projects</span>
              </a>
            </li>
            <li>
              <a href="#tasks">
                <i className="bi bi-list-task"></i>
                <span>Tasks</span>
              </a>
            </li>
            <li>
              <a href="#team">
                <i className="bi bi-cash-stack"></i>
                <span>Budget Tracker</span>
              </a>
            </li>
            <li>
              <a href="#reports">
                <i className="bi bi-bar-chart"></i>
                <span>Reports</span>
              </a>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

        {/* navigation bar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm position-relative">
          <div className="container-fluid">
            <button className="btn btn-icon me-3" onClick={toggleSidebar}>
              <i className="bi bi-list"></i>
            </button>

            {/* Notification Icon */}
            <div className="ms-auto position-relative" ref={notificationRef}>
              <button className="btn btn-icon position-relative" onClick={toggleNotification}>
                <i className="bi bi-bell fs-5"></i>
                <span className="notification-badge">3</span>
              </button>

              {/* notification default for design */}
              {showNotification && (
                <div className="notification-popup shadow-sm">
                  <div className="notification-header fw-bold px-3 pt-2">Notifications</div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">You have a new message</li>
                    <li className="list-group-item">Project deadline tomorrow</li>
                    <li className="list-group-item">System update available</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="container-fluid p-4">
          <h2 className="mb-4 fw-bold">Dashboard</h2>

          {/* Project and Budget Cards */}
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card shadow-sm p-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-folder-check me-3 text-primary fs-3"></i>
                  <h5 className="m-0">Total Projects</h5>
                </div>
                <h3 className="mt-2 fw-bold">24</h3>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm p-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-wallet2 me-3 text-success fs-3"></i>
                  <h5 className="m-0">Budget Tracking</h5>
                </div>
                <h3 className="mt-2 fw-bold">₱50,000</h3>
              </div>
            </div>
          </div>

          {/* Project Table */}
          <div className="card mt-4 shadow-sm p-3">
            <h4 className="fw-bold">Ongoing Projects</h4>
            <table className="table table-bordered mt-3">
              <thead className="table-light">
                <tr>
                  <th>Project</th>
                  <th>Project Manager</th>
                  <th>Timeline</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Website Redesign</td>
                  <td>Obrey Monter</td>
                  <td>
                    <div className="progress">
                      <div className="progress-bar bg-primary" style={{ width: "60%" }}></div>
                    </div>
                  </td>
                  <td><span className="badge bg-success">Done</span></td>
                  <td>April 10, 2025</td>
                </tr>
                <tr>
                  <td>Mobile App Development</td>
                  <td>Eden Nataya</td>
                  <td>
                    <div className="progress">
                      <div className="progress-bar bg-warning" style={{ width: "40%" }}></div>
                    </div>
                  </td>
                  <td><span className="badge bg-warning">In Progress</span></td>
                  <td>April 10, 2025</td>
                </tr>
                <tr>
                  <td>Marketing Campaign</td>
                  <td>Niko Nositera</td>
                  <td>
                    <div className="progress">
                      <div className="progress-bar bg-danger" style={{ width: "20%" }}></div>
                    </div>
                  </td>
                  <td><span className="badge bg-danger">Stuck</span></td>
                  <td>April 10, 2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
