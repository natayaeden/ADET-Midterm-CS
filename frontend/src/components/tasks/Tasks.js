// components/tasks/Tasks.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Spinner, Alert, Dropdown, ListGroup } from 'react-bootstrap';

const Tasks = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState({});

  useEffect(() => {
    fetchProjectAndTasks();
    fetchUsers();
  }, [projectId]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Convert users array to a map for easy lookup
        const usersMap = {};
        data.forEach(user => {
          usersMap[user.id] = user.name;
        });
        setUsers(usersMap);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjectAndTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch project details
      const projectResponse = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch tasks for the project
      const tasksResponse = await fetch(`http://localhost:8000/api/projects/${projectId}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const projectData = await projectResponse.json();
      const tasksData = await tasksResponse.json();
      
      setProject(projectData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
    } finally {
      setLoading(false); 
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update task in local state
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'secondary';
      default:
        return 'info';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Function to get user name from ID
  const getUserName = (userId) => {
    if (!userId) return 'Unassigned';
    return users[userId] || 'Unknown User';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading tasks...</span>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <Container fluid className="px-4 py-4 tasks-page">
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <Row className="align-items-center mb-4">
            <Col>
              <Button 
                variant="outline-secondary" 
                className="mb-3" 
                onClick={() => navigate(`/projects/${projectId}`)}
              >
                <i className="bi bi-arrow-left me-2"></i> Back to Project
              </Button>
              <h2 className="mb-1 fw-bold">{project?.title || 'Project'}: Tasks</h2>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to="/projects" className="text-decoration-none">Projects</Link></li>
                  <li className="breadcrumb-item"><Link to={`/projects/${projectId}`} className="text-decoration-none">{project?.title}</Link></li>
                  <li className="breadcrumb-item active">Tasks</li>
                </ol>
              </nav>
            </Col>
            <Col xs="auto">
              <Link to={`/projects/${projectId}/tasks/new`} className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>New Task
              </Link>
            </Col>
          </Row>
          
          {/* Filter and Search */}
          <Row className="mb-4">
            <Col md={4} className="mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <i className="bi bi-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={8}>
              <div className="btn-group float-md-end" role="group">
                <Button
                  variant={filter === 'all' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'pending' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filter === 'in_progress' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('in_progress')}
                >
                  In Progress
                </Button>
                <Button
                  variant={filter === 'completed' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </Button>
              </div>
            </Col>
          </Row>
          
          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
            <Alert variant="info">
              <i className="bi bi-info-circle-fill me-2"></i>
              No tasks found. {filter !== 'all' && <span>Try changing your filter.</span>}
            </Alert>
          ) : (
            <ListGroup className="shadow-sm">
              {filteredTasks.map(task => {
                const daysRemaining = getDaysRemaining(task.due_date);
                
                return (
                  <ListGroup.Item key={task.id} action className="border-0 border-bottom rounded-0 py-3">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                      <div style={{ maxWidth: '70%' }}>
                        <Link to={`/tasks/${task.id}`} className="text-decoration-none">
                          <h5 className="mb-1 fw-semibold">{task.title}</h5>
                        </Link>
                        <p className="mb-1 text-muted">{task.description}</p>
                        <div className="small">
                          <span className="me-3">
                            <i className="bi bi-calendar-event me-1"></i>
                            <span className={daysRemaining !== null && daysRemaining < 0 ? 'text-danger' : ''}>
                              {formatDate(task.due_date)}
                              {daysRemaining !== null && daysRemaining < 0 && ' (overdue)'}
                            </span>
                          </span>
                          <Badge bg={getPriorityBadgeVariant(task.priority)} className="me-2">
                            {task.priority}
                          </Badge>
                          <span>
                            <i className="bi bi-person me-1"></i>
                            {getUserName(task.assigned_to)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center">
                        <Dropdown className="me-2">
                          <Dropdown.Toggle 
                            variant={getStatusBadgeVariant(task.status)} 
                            size="sm"
                          >
                            {getStatusText(task.status)}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleStatusChange(task.id, 'pending')}>
                              Pending
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleStatusChange(task.id, 'in_progress')}>
                              In Progress
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleStatusChange(task.id, 'completed')}>
                              Completed
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        <Link to={`/tasks/${task.id}`} className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-eye"></i>
                        </Link>
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      <style jsx>{`
        .list-group-item:hover {
          background-color: #f8f9fa;
        }
        
        .breadcrumb-item + .breadcrumb-item::before {
          color: #6c757d;
        }
      `}</style>
    </Container>
  );
};

export default Tasks;