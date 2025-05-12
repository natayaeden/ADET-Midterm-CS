import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, NavLink } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../componentStyles/Dashboard.css";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showNotification, setShowNotification] = useState(false);
  const notificationRef = useRef(null);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleNotification = () => setShowNotification(!showNotification);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true); // Always open on desktop by default
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotification(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    window.location.href = "/";
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Determine sidebar and main-content classes
  const sidebarClass = isMobile
    ? isSidebarOpen ? "sidebar open" : "sidebar closed"
    : isSidebarOpen ? "sidebar open" : "sidebar closed";
  const mainContentClass = isMobile
    ? isSidebarOpen ? "main-content sidebar-open" : "main-content sidebar-closed"
    : isSidebarOpen ? "main-content sidebar-open" : "main-content sidebar-closed";

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={sidebarClass}>
        <div className="sidebar-header">
          <span className="sidebar-brand">Klick Inc.</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} end>
                <i className="bi bi-grid"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="bi bi-folder"></i>
                <span>Projects</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="bi bi-bar-chart"></i>
                <span>Reports & Analytics</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/budget" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="bi bi-cash-stack"></i>
                <span>Budget Tracker</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/risk-management" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="bi bi-shield-exclamation"></i>
                <span>Risk Management</span>
              </NavLink>
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

      {/* Main Content with Navbar */}
      <main className={mainContentClass}>
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm position-relative">
          <div className="container-fluid">
            <button 
              className="btn btn-icon d-flex align-items-center justify-content-center" 
              onClick={toggleSidebar}
              aria-label="Toggle Sidebar"
            >
              <i className="bi bi-list fs-4"></i>
            </button>
            <div className="ms-auto position-relative" ref={notificationRef}>
              <button className="btn btn-icon position-relative" onClick={toggleNotification}>
                <i className="bi bi-bell fs-5"></i>
                <span className="notification-badge">3</span>
              </button>
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
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
