import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../componentStyles/Projects.css';

const Projects = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    id: null,
    name: '',
    manager: '',
    status: 'Not Started',
    dueDate: ''
  });

  // Load projects from localStorage on component mount
  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects]);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentProject({
      id: null,
      name: '',
      manager: '',
      status: 'Not Started',
      dueDate: ''
    });
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProject({
      ...currentProject,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editMode) {
      // Update existing project
      setProjects(
        projects.map((project) =>
          project.id === currentProject.id ? currentProject : project
        )
      );
    } else {
      // Add new project
      const newProject = {
        ...currentProject,
        id: Date.now() // Unique ID based on the timestamp
      };
      setProjects([...projects, newProject]);
    }

    handleCloseModal();
  };

  const handleEdit = (project) => {
    setCurrentProject(project);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter((project) => project.id !== id));
    }
  };

  const navigate = useNavigate();

  const handleProjectClick = (project) => {
    navigate(`/projects/${project.id}/tasks`, { state: { project } });
  };

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
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Project Name</th>
                <th>Project Manager</th>
                <th>Status</th>
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
                  <td>{project.manager}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>{formatDate(project.dueDate)}</td>
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
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Project' : 'Create New Project'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentProject.name}
                onChange={handleInputChange}
                placeholder="Enter project name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Project Manager</Form.Label>
              <Form.Control
                type="text"
                name="manager"
                value={currentProject.manager}
                onChange={handleInputChange}
                placeholder="Enter project manager name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={currentProject.status}
                onChange={handleInputChange}
                required
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                name="dueDate"
                value={currentProject.dueDate}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

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

// Helper functions
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Not Started':
      return 'bg-secondary';
    case 'In Progress':
      return 'bg-primary';
    case 'On Hold':
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
