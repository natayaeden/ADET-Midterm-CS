// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import '../componentStyles/Dashboard.css';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0 },
    tasks: { total: 0, completed: 0, overdue: 0 },
    users: { total: 0, managers: 0, members: 0 }
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch statistics
      const statsResponse = await fetch('http://localhost:8000/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch recent projects
      const projectsResponse = await fetch('http://localhost:8000/api/projects/recent', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch upcoming tasks
      const tasksResponse = await fetch('http://localhost:8000/api/tasks/upcoming', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!statsResponse.ok || !projectsResponse.ok || !tasksResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const statsData = await statsResponse.json();
      const projectsData = await projectsResponse.json();
      const tasksData = await tasksResponse.json();
      
      setStats(statsData);
      setRecentProjects(projectsData);
      setUpcomingTasks(tasksData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for project status chart
  const projectStatusData = {
    labels: ['Active Projects', 'Completed Projects'],
    datasets: [
      {
        data: [
          stats.projects.active, 
          (stats.projects.total - stats.projects.active)
        ],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  // Prepare data for task status chart
  const taskStatusData = {
    labels: ['Completed', 'Overdue', 'In Progress'],
    datasets: [
      {
        data: [
          stats.tasks.completed,
          stats.tasks.overdue,
          (stats.tasks.total - stats.tasks.completed - stats.tasks.overdue)
        ],
        backgroundColor: ['#4BC0C0', '#FF6384', '#FFCE56'],
        hoverBackgroundColor: ['#4BC0C0', '#FF6384', '#FFCE56'],
      },
    ],
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Welcome, {user?.name.charAt(0).toUpperCase() + user?.name.slice(1)}!</h1>
      </div>
      
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3 h-100">
            <div className="card-body d-flex flex-column align-items-center">
              <h5 className="card-title">Total Projects</h5>
              <h2 className="display-4 fw-bold mb-0">{stats.projects.total}</h2>
              <p className="mt-2 mb-0">{stats.projects.active} active</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3 h-100">
            <div className="card-body d-flex flex-column align-items-center">
              <h5 className="card-title">Tasks</h5>
              <h2 className="display-4 fw-bold mb-0">{stats.tasks.total}</h2>
              <p className="mt-2 mb-0">{stats.tasks.completed} completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-danger mb-3 h-100">
            <div className="card-body d-flex flex-column align-items-center">
              <h5 className="card-title">Overdue Tasks</h5>
              <h2 className="display-4 fw-bold mb-0">{stats.tasks.overdue}</h2>
              <p className="mt-2 mb-0">require attention</p>
            </div>
          </div>
        </div>
        {/* <div className="col-md-3"> */}
          {/* <div className="card text-white bg-info mb-3 h-100">
            <div className="card-body d-flex flex-column align-items-center">
              <h5 className="card-title">System Users</h5>
              <h2 className="display-4 fw-bold mb-0">{stats.users.total}</h2>
              <p className="mt-2 mb-0">{stats.users.managers} managers, {stats.users.members} members</p>
            </div>
          </div> */}
        {/* </div> */}
      </div>
      
      {/* Charts Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Project Status</h5>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              {stats.projects.total > 0 ? (
                <div style={{ width: '250px', height: '250px' }}>
                  <Pie data={projectStatusData} options={{ maintainAspectRatio: true }} />
                </div>
              ) : (
                <div className="text-center text-muted">
                  <p>No project data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Task Status</h5>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              {stats.tasks.total > 0 ? (
                <div style={{ width: '250px', height: '250px' }}>
                  <Pie data={taskStatusData} options={{ maintainAspectRatio: true }} />
                </div>
              ) : (
                <div className="text-center text-muted">
                  <p>No task data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Projects and Upcoming Tasks */}
      <div className="row mb-4">
        {/* Recent Projects */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Projects</h5>
              <Link to="/projects" className="btn btn-sm btn-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              {recentProjects.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p>No recent projects found</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentProjects.map(project => (
                    <Link 
                      key={project.id} 
                      to={`/projects/${project.id}`} 
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{project.name}</h6>
                        <span className={`badge ${project.status === 'Completed' ? 'bg-success' : 'bg-primary'}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="mb-1 text-truncate small">
                        {project.description || 'No description provided'}
                      </p>
                      <small className="text-muted">
                        Manager: {project.manager?.name || 'Unassigned'} | 
                        Last updated: {new Date(project.updated_at).toLocaleDateString()}
                      </small>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Upcoming Tasks */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Tasks</h5>
              <Link to="/projects" className="btn btn-sm btn-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p>No upcoming tasks found</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {upcomingTasks.map(task => (
                    <Link 
                      key={task.id} 
                      to={`/tasks/${task.id}`} 
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{task.title}</h6>
                        <span className={`badge ${
                          task.priority === 'urgent' ? 'bg-danger' : 
                          task.priority === 'high' ? 'bg-warning' : 
                          task.priority === 'medium' ? 'bg-info' : 'bg-secondary'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <small className="text-muted">
                        Due: {new Date(task.due_date).toLocaleDateString()} | 
                        Project: {task.project_title}
                      </small>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
