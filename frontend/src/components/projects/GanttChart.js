import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

const GanttChart = ({ project }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize Gantt chart
        gantt.init('gantt_container');

        // Configure Gantt chart
        gantt.config.date_format = '%Y-%m-%d %H:%i';
        gantt.config.auto_scheduling = true;
        gantt.config.auto_scheduling_strict = true;
        gantt.config.work_time = true;
        gantt.config.correct_span_days = true;
        gantt.config.min_column_width = 40;
        gantt.config.scale_height = 50;
        gantt.config.row_height = 30;

        // Load tasks
        const loadTasks = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/projects/${project.id}/tasks`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to load tasks: ${response.statusText}`);
                }
                const data = await response.json();
                const ganttTasks = data.map(task => ({
                    id: task.id,
                    text: task.title,
                    start_date: task.start_date ? new Date(task.start_date) : new Date(),
                    end_date: task.due_date ? new Date(task.due_date) : new Date(),
                    progress: task.status === 'Completed' ? 1 : 
                            task.status === 'In Progress' ? 0.5 : 
                            task.status === 'Under Review' ? 0.75 : 0,
                    parent: task.parent_id || 0,
                    open: true
                }));
                setTasks(ganttTasks);
                gantt.parse({ data: ganttTasks });
            } catch (error) {
                console.error('Error loading tasks:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadTasks();

        // Cleanup
        return () => {
            gantt.clearAll();
        };
    }, [project]);

    return (
        <Card className="mb-4">
            <Card.Header>
                <h5 className="mb-0">Project Timeline</h5>
            </Card.Header>
            <Card.Body>
                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : (
                    <div 
                        id="gantt_container" 
                        style={{ 
                            width: '100%', 
                            height: '500px',
                            minHeight: '300px'
                        }}
                    />
                )}
            </Card.Body>
        </Card>
    );
};

export default GanttChart; 