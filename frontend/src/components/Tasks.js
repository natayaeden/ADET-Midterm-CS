import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import '../componentStyles/Tasks.css';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentTask, setCurrentTask] = useState({
        id: null,
        projectId: '',
        name: '',
        description: '',
        assignee: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: '',
        budget: ''
    });

    const location = useLocation();
    const navigate = useNavigate();
    const project = location.state?.project;

    // Load tasks from localStorage on component mount or when project changes
    useEffect(() => {
        if (!project) {
            navigate('/projects');
            return;
        }

        // Get stored tasks for the specific project
        const storedTasks = JSON.parse(localStorage.getItem(`tasks_${project.id}`)) || [];
        setTasks(storedTasks);
    }, [project, navigate]);

    // Save tasks to localStorage whenever tasks state changes
    useEffect(() => {
        if (project) {
            localStorage.setItem(`tasks_${project.id}`, JSON.stringify(tasks));
        }
    }, [tasks, project]);

    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentTask({
            id: null,
            projectId: project?.id || '',
            name: '',
            description: '',
            assignee: '',
            priority: 'Medium',
            status: 'To Do',
            dueDate: '',
            budget: ''
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editMode) {
            setTasks(
                tasks.map((task) => (task.id === currentTask.id ? currentTask : task))
            );
        } else {
            const newTask = {
                ...currentTask,
                id: Date.now() // Use timestamp as task ID
            };
            setTasks([...tasks, newTask]);
        }

        handleCloseModal();
    };

    const handleEdit = (task) => {
        setCurrentTask(task);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setTasks(tasks.filter((task) => task.id !== id));
        }
    };

    const handleTaskClick = (task) => {
        navigate(`/tasks/${task.id}`, { state: { task } });
    };

    const getTaskStatusClass = (status) => {
        switch (status) {
            case 'To Do':
                return 'status-todo';
            case 'In Progress':
                return 'status-progress';
            case 'Under Review':
                return 'status-review';
            case 'Completed':
                return 'status-completed';
            default:
                return 'status-todo';
        }
    };

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

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'Low':
                return 'priority-low';
            case 'Medium':
                return 'priority-medium';
            case 'High':
                return 'priority-high';
            case 'Critical':
                return 'priority-critical';
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

    if (!project) return null;

    return (
        <div className="tasks-container">
            <div className="project-header">
                <div>
                    <Button className="backbutton" variant="outline-secondary" onClick={() => navigate('/projects')}>
                        ← Back to Projects
                    </Button>
                    <h2>{project.name} Tasks</h2>
                    <p className="project-meta">
                        <span className="manager-info">
                            <i className="bi bi-person-circle me-1"></i>
                            {project.manager}
                        </span>
                        <span className={`status-badge badge ${getStatusBadgeClass(project.status)}`}>
                            {project.status}
                        </span>
                        <span className="due-date">
                            <i className="bi bi-calendar me-1"></i>
                            Due: {formatDate(project.dueDate)}
                        </span>
                    </p>
                </div>
                <Button variant="primary" onClick={handleShowModal}>
                    <i className="bi bi-plus-circle me-2"></i>Add Task
                </Button>
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
                                <th>Task Name</th>
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
                                        <div className="task-name">{task.name}</div>
                                        <div className="task-description text-muted">{task.description}</div>
                                    </td>
                                    <td>{task.assignee}</td>
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
                                    <td>{formatDate(task.dueDate)}</td>
                                    <td>₱{task.budget}</td>
                                    <td>
                                        <div className="actions-container">
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEdit(task)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(task.id)}
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
                            <Form.Label>Task Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentTask.name}
                                onChange={handleInputChange}
                                placeholder="Enter task name"
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
                                    <Form.Control
                                        type="text"
                                        name="assignee"
                                        value={currentTask.assignee}
                                        onChange={handleInputChange}
                                        placeholder="Enter assignee name"
                                        required
                                    />
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
                                        <option value="Critical">Critical</option>
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
                                        name="dueDate"
                                        value={currentTask.dueDate}
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
                                        name="budget"
                                        value={currentTask.budget}
                                        onChange={handleInputChange}
                                        placeholder="Enter task budget"
                                        required
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <Button variant="primary" type="submit" className="w-100">
                            {editMode ? 'Save Changes' : 'Add Task'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Tasks;
