import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Badge, ProgressBar, Tab, Tabs, Alert } from 'react-bootstrap';
import ProjectGanttChart from './ProjectGanttChart';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProject();
    fetchStatistics();
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      
      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/projects/${id}/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch project statistics');
      }
      
      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Queue':
        return 'bg-secondary';
      case 'To Do':
        return 'bg-info';
      case 'In Progress':
        return 'bg-primary';
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

  if (loading) {
    return <div className="text-center mt-5">Loading project details...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!project) {
    return <Alert variant="warning">Project not found</Alert>;
  }

  return (
    <div className="project-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{project.name}</h2>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={() => navigate(`/projects/${id}/tasks`)}
          >
            <i className="bi bi-list-task me-1"></i> Tasks
          </Button>
          <Button 
            variant="outline-success" 
            className="me-2"
            onClick={() => navigate(`/projects/${id}/budget`)}
          >
            <i className="bi bi-cash-coin me-1"></i> Budget
          </Button>
          <Button 
            variant="outline-secondary"
            onClick={() => navigate('/projects')}
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Projects
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <h5>Description</h5>
              <p>{project.description || 'No description provided'}</p>
            </Col>
            <Col md={4}>
              <div className="project-meta">
                <p>
                  <strong>Status:</strong>{' '}
                  <Badge className={getStatusBadgeClass(project.status)}>
                    {project.status}
                  </Badge>
                </p>
                <p>
                  <strong>Manager:</strong>{' '}
                  {project.manager ? project.manager.name : 'Unassigned'}
                </p>
                <p>
                  <strong>Start Date:</strong> {formatDate(project.start_date)}
                </p>   
                <p>
                  <strong>Due Date:</strong> {formatDate(project.due_date)}
                </p>
                <p>
                  <strong>Budget:</strong> ₱{parseFloat(project.budget).toLocaleString()}
                </p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {statistics && (
        <div className="project-dashboard mb-4">
          <h4 className="mb-3">Project Progress</h4>
          <Row>
            <Col md={6} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>Task Completion</Card.Title>
                  <h3 className="display-6 text-center">
                    {statistics.completed_tasks} / {statistics.total_tasks}
                  </h3>
                  <ProgressBar 
                    now={statistics.completion_percentage} 
                    label={`${Math.round(statistics.completion_percentage)}%`} 
                    className="mt-2" 
                    variant="success" 
                  />
                  <Card.Text className="text-center mt-2">
                    <small className="text-muted">
                      {Math.round(statistics.completion_percentage)}% Complete
                    </small>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>Budget Utilization</Card.Title>
                  <h3 className="display-6 text-center">
                    ₱{parseFloat(statistics.total_expenditure).toLocaleString()} / ₱{parseFloat(project.budget).toLocaleString()}
                  </h3>
                  <ProgressBar 
                    now={statistics.budget_utilization_percentage} 
                    label={`${Math.round(statistics.budget_utilization_percentage)}%`} 
                    className="mt-2" 
                    variant={statistics.budget_utilization_percentage > 90 ? "danger" : "info"} 
                  />
                  <Card.Text className="text-center mt-2">
                    <small className="text-muted">
                      ₱{parseFloat(statistics.budget_remaining).toLocaleString()} Remaining
                    </small>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      <Tabs className="mb-3">
        <Tab eventKey="tasks" title="Recent Tasks">
          <div className="p-3 bg-light rounded">
            <p className="text-center">
              <Link to={`/projects/${id}/tasks`} className="btn btn-primary">
                View All Tasks
              </Link>
            </p>
          </div>
        </Tab>
        <Tab eventKey="activity" title="Activity">
          <div className="p-3 bg-light rounded">
            <p className="text-center text-muted">No recent activity</p>
          </div>
        </Tab>
      </Tabs>

      <ProjectGanttChart projectId={id} />
    </div>
  );
};

export default ProjectDetail;
