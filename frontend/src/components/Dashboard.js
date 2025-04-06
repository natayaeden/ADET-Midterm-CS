import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../componentStyles/Dashboard.css';

const Dashboard = () => {
  return (
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
  )
};

export default Dashboard;
