import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

const TaskDetails = () => {
    const { state } = useLocation();
    const task = state?.task;
    const navigate = useNavigate();
    const { taskId } = useParams();

    if (!task) {
        navigate('/projects'); 
        return null;
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <Card className="shadow-lg">
                        <Card.Header as="h3" className="bg-primary text-white text-center">
                            {task.name} - Task Details
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <strong>Description:</strong>
                                <p>{task.description}</p>
                            </div>
                            <div className="mb-3">
                                <strong>Assignee:</strong>
                                <p>{task.assignee}</p>
                            </div>
                            <div className="mb-3">
                                <strong>Priority:</strong>
                                <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
                            </div>
                            <div className="mb-3">
                                <strong>Status:</strong>
                                <span className={`badge ${getStatusBadgeClass(task.status)}`}>{task.status}</span>
                            </div>
                            <div className="mb-3">
                                <strong>Due Date:</strong>
                                <p>{new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="mb-3">
                                <strong>Budget:</strong>
                                <p>₱{task.budget}</p>
                            </div>

                            <Button variant="secondary" onClick={() => navigate(-1)} className="w-100">
                                Back to Tasks
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Helper function to determine priority badge class
const getPriorityBadgeClass = (priority) => {
    switch (priority) {
        case 'Low':
            return 'bg-success';
        case 'Medium':
            return 'bg-warning';
        case 'High':
            return 'bg-danger';
        case 'Critical':
            return 'bg-dark';
        default:
            return 'bg-secondary';
    }
};

// Helper function to determine status badge class
const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'To Do':
            return 'bg-secondary';
        case 'In Progress':
            return 'bg-primary';
        case 'Under Review':
            return 'bg-info';
        case 'Completed':
            return 'bg-success';
        default:
            return 'bg-light';
    }
};

export default TaskDetails;
