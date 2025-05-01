import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { getStatusBadgeClass } from './Projects';
import { useLocation, useNavigate } from 'react-router-dom';
import '../componentStyles/Tasks.css';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentTask, setCurrentTask] = useState({
        id: null,
        project_id: '',
        title: '',
        description: '',
        assigned_to: '',
        priority: 'Medium',
        status: 'To Do',
        due_date: '',
        task_budget: ''
    });

    const location = useLocation();
    const navigate = useNavigate();
    
    // Get project from location state or local storage
    const projectFromLocation = location.state?.project;
    const [project, setProject] = useState(null);

    useEffect(() => {
        // If we have project in location state, use it and save to localStorage
        if (projectFromLocation) {
            setProject(projectFromLocation);
            localStorage.setItem('currentProject', JSON.stringify(projectFromLocation));
        } else {
            // Try to get project from localStorage
            const savedProject = JSON.parse(localStorage.getItem('currentProject'));
            if (savedProject) {
                setProject(savedProject);
            } else {
                // No project found, navigate back to projects
                navigate('/projects');
            }
        }
    }, [projectFromLocation, navigate]);

    useEffect(() => {
        if (project) {
            // Fetch tasks for this project from the API
            const fetchTasks = async () => {
                try {
                    const response = await fetch(`/api/projects/${project.id}/tasks`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setTasks(data);
                    }
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                }
            };

            fetchTasks();
        }
    }, [project]);

    useEffect(() => {
        // Fetch users for assignee dropdown
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentTask({
            id: null,
            project_id: project?.id || '',
            title: '',
            description: '',
            assigned_to: '',
            priority: 'Medium',
            status: 'To Do',
            due_date: '',
            task_budget: ''
        });
    };

    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentTask({
            ...currentTask,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editMode 
                ? `/api/tasks/${currentTask.id}`
                : `/api/projects/${project.id}/tasks`;
            
            const method = editMode ? 'PUT' : 'POST';

            const taskData = {
                ...currentTask,
                project_id: project.id
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                const updatedTask = await response.json();
                
                if (editMode) {
                    setTasks(tasks.map(task => 
                        task.id === updatedTask.id ? updatedTask : task
                    ));
                } else {
                    setTasks([...tasks, updatedTask]);
                }
                
                handleCloseModal();
            } else {
                const error = await response.json();
                alert(error.message || 'Error saving task');
            }
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Error saving task');
        }
    };

    const handleEdit = (task, e) => {
        e.stopPropagation(); // Prevent row click event from firing
        setCurrentTask({
            ...task,
            assigned_to: task.assignedTo ? task.assignedTo.id : ''
        });
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await fetch(`/api/tasks/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    setTasks(tasks.filter(task => task.id !== id));
                } else {
                    alert('Error deleting task');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Error deleting task');
            }
        }
    };

    const handleTaskClick = (task) => {
        navigate(`/tasks/${task.id}`, { 
            state: { 
                task,
                project: project  // Pass project along with task
            } 
        });
    };

    const getTaskStatusClass = (status) => {
        switch (status) {
            case 'To Do':
                return 'status-todo';
            case 'In Progress':
                return 'status-progress';
            case 'Done':
                return 'status-done';
            default:
                return 'status-todo';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'In Queue':
                return 'bg-secondary';
            case 'Not Started':
                return 'bg-secondary';
            case 'To Do':
                return 'bg-info';
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

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'Low':
                return 'priority-low';
            case 'Medium':
                return 'priority-medium';
            case 'High':
                return 'priority-high';
            default:
                return 'priority-medium';
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

    const formatCurrency = (amount) => {
        if (!amount) return '₱0';
        return '₱' + parseFloat(amount).toLocaleString();
    };

    if (!project) return null;

    return (
        <div className="tasks-container">
            {/* Enhanced Project Header */}
            <div className="project-header mb-4">
                <div className="card w-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <Button className="backbutton" variant="outline-secondary" onClick={() => navigate('/projects')}>
                                ← Back to Projects
                            </Button>
                        </div>
                        <h2 className="mb-0">{project.name}</h2>
                        <Button variant="primary" onClick={handleShowModal}>
                            <i className="bi bi-plus-circle me-2"></i>Add Task
                        </Button>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-8">
                                <h5 className="card-title">Project Details</h5>
                                <p className="card-text">{project.description}</p>
                            </div>
                            <div className="col-md-4">
                                <div className="project-meta-details">
                                    <p>
                                        <strong>Project Manager:</strong> {project.project_manager || project.manager || "Not assigned"}
                                    </p>
                                    <p>
                                        <strong>Status:</strong> <Badge className={getStatusBadgeClass(project.status)}>{project.status}</Badge>
                                    </p>
                                    <p>
                                        <strong>Timeline:</strong> {formatDate(project.start_date || project.startDate)} - {formatDate(project.due_date || project.dueDate)}
                                    </p>
                                    <p>
                                        <strong>Budget:</strong> {formatCurrency(project.project_budget || project.budget)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                {tasks.length === 0 ? (
                    <div className="no-tasks">
                        <p>No tasks found for this project. Add your first task to get started!</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Task Title</th>
                                    <th>Assignee</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th>Budget</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task.id} className="task-row" onClick={() => handleTaskClick(task)}>
                                        <td>
                                            <div className="task-name">{task.title}</div>
                                            <div className="task-description text-muted">{task.description}</div>
                                        </td>
                                        <td>
                                            {typeof task.assigned_to === 'object' ? task.assigned_to.name : 
                                             task.assigned_to ? users.find(u => u.id === parseInt(task.assigned_to))?.name : 'Unassigned'}
                                        </td>
                                        <td>
                                            <span className={`priority-badge ${getPriorityBadgeClass(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${getTaskStatusClass(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(task.due_date)}</td>
                                        <td>{formatCurrency(task.task_budget)}</td>
                                        <td>
                                            <div className="actions-container">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={(e) => handleEdit(task, e)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={(e) => handleDelete(task.id, e)}
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

                <Modal show={showModal} onHide={handleCloseModal} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>{editMode ? 'Edit Task' : 'Create New Task'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Task Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={currentTask.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter task title"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={currentTask.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter task description"
                                />
                            </Form.Group>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Assignee</Form.Label>
                                        <Form.Select
                                            name="assigned_to"
                                            value={currentTask.assigned_to}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Assignee</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Priority</Form.Label>
                                        <Form.Select
                                            name="priority"
                                            value={currentTask.priority}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select
                                            name="status"
                                            value={currentTask.status}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="To Do">To Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Completed">Completed</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Due Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="due_date"
                                            value={currentTask.due_date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Budget</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="task_budget"
                                            value={currentTask.task_budget}
                                            onChange={handleInputChange}
                                            placeholder="Enter budget amount"
                                            required
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end">
                                <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                                    Close
                                </Button>
                                <Button variant="primary" type="submit">
                                    {editMode ? 'Update Task' : 'Add Task'}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
    );
};

export default Tasks;