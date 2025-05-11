import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Box, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../componentStyles/Projects.css';
import Tasks from './Tasks';
import RiskManagement from './RiskManagement';
import IssueManagement from './IssueManagement';
import ProjectReports from './ProjectReports';

const Projects = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    id: null,
    name: '',
    description: '',
    user_id: '',
    budget: '',
    status: 'To Do',
    start_date: '',
    due_date: ''
  });
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentProject({
      id: null,
      name: '',
      description: '',
      user_id: '',
      budget: '',
      status: 'To Do',
      start_date: '',
      due_date: ''
    });
  };

  const handleShowModal = () => {
    const currentUser = JSON.parse(localStorage.getItem('user')) || null;
    setCurrentProject({
      id: null,
      name: '',
      description: '',
      user_id: currentUser ? currentUser.id : '',
      budget: '',
      status: 'To Do',
      start_date: '',
      due_date: ''
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProject((prev) => ({
      ...prev,
      [name]: name === 'budget' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      let response;
      if (editMode) {
        response = await fetch(`http://localhost:8000/api/projects/${currentProject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(currentProject)
        });
      } else {
        response = await fetch('http://localhost:8000/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(currentProject)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save project');
      }

      await fetchProjects(); // Refresh the projects list
      handleCloseModal();
    } catch (error) {
      alert('Error saving project: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete project');
        }

        await fetchProjects(); // Refresh the projects list
      } catch (error) {
        alert('Error deleting project: ' + error.message);
      }
    }
  };

  const navigate = useNavigate();

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setActiveTab(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <div className="text-center p-4">Loading projects...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-danger">Error: {error}</div>;
  }

  return (
    <div className="projects-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Projects</h2>
        <Button variant="primary" onClick={handleShowModal}>
          <i className="bi bi-plus-circle me-2"></i>Create New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="no-projects">
          <p>No projects found. Create your first project to get started!</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Budget</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="project-row"
                  >
                    <td>{project.name}</td>
                    <td>{project.manager?.name || 'Unassigned'}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>₱{parseFloat(project.budget).toLocaleString()}</td>
                    <td>{formatDate(project.due_date)}</td>
                    <td>
                      <div className="actions-container" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(project);
                          }}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id);
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedProject && (
            <div className="mt-4">
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="project tabs">
                  <Tab label="Tasks" />
                  <Tab label="Risks" />
                  <Tab label="Issues" />
                  <Tab label="Reports" />
                </Tabs>
              </Box>
              <Box sx={{ mt: 2 }}>
                {activeTab === 0 && <Tasks projectId={selectedProject.id} />}
                {activeTab === 1 && <RiskManagement projectId={selectedProject.id} />}
                {activeTab === 2 && <IssueManagement projectId={selectedProject.id} />}
                {activeTab === 3 && <ProjectReports projectId={selectedProject.id} />}
              </Box>
            </div>
          )}
        </>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Project' : 'Create New Project'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              {/* Project Name */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentProject.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>

              {/* Project Manager */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Project Manager</Form.Label>
                  <Form.Control
                    type="text"
                    name="user_id"
                    value={currentProject.user_id}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>

              {/* Description */}
              <div className="col-12 mb-3">
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={currentProject.description}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>

              {/* Budget */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Budget (₱)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="budget"
                    value={currentProject.budget}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>

              {/* Status */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={currentProject.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Date Start */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Date Started</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={currentProject.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>

              {/* Due Date */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="due_date"
                    value={currentProject.due_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editMode ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </Form>
        </Modal.Body>

      </Modal>
    </div>
  );
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'To Do':
      return 'bg-primary';
    case 'In Progress':
      return 'bg-warning';
    case 'Completed':
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default Projects;