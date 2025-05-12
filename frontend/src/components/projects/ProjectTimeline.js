import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import './ProjectTimeline.css';

function getMonthLabels(start, end) {
  const months = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

const ProjectTimeline = ({ project }) => {
  const [tasks, setTasks] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!project) return;

    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/tasks?project_id=${project.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasksData = await response.json();
        const validTasks = tasksData.filter(task => {
          const start = new Date(task.start_date || task.created_at);
          const end = new Date(task.due_date);
          return !isNaN(start.getDate()) && !isNaN(end.getDate()) && end > start;
        });
        setTasks(validTasks);
        const dates = validTasks.map(task => ({
          start: new Date(task.start_date || task.created_at),
          end: new Date(task.due_date)
        }));
        let minDate, maxDate;
        if (dates.length > 0) {
          minDate = new Date(Math.min(...dates.map(d => d.start)));
          maxDate = new Date(Math.max(...dates.map(d => d.end)));
          // Ensure that minDate starts at the first of the month
          minDate.setDate(1);
          // Ensure that maxDate goes to the last day of the month
          maxDate.setMonth(maxDate.getMonth() + 1, 0);
        } else {
          minDate = new Date();
          maxDate = new Date();
        }
        setDateRange({ start: minDate, end: maxDate });
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    fetchTasks();
  }, [project]);

  if (!dateRange.start || !dateRange.end) return null;

  // Calculate total days for percentage calculation
  const totalDays = (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24);

  // Generate months for the gantt chart
  const monthLabels = getMonthLabels(dateRange.start, dateRange.end);

  const getOffsetPercent = (date) => {
    const offset = (date - dateRange.start) / (1000 * 60 * 60 * 24);
    const percent = (offset / totalDays) * 100;
    console.log(`Offset Percent: ${percent}%`); // Log to check if it's calculated correctly
    return percent;
  };

  const getDurationPercent = (start, end) => {
    const duration = (end - start) / (1000 * 60 * 60 * 24);
    const percent = (duration / totalDays) * 100;
    console.log(`Duration Percent: ${percent}%`); // Log to check if it's calculated correctly
    return percent;
  };

  return (
    <div className="col-12">
      <Card className="mb-3 gantt-card">
        <Card.Body>
          <div className="gantt-header bg-info">
            <div className="d-flex">
              <h3 className="m-1"><strong>{project?.name}</strong></h3>              
            </div>
          </div>

          <div className="gantt-months d-flex justify-content-between align-items-center px-3 py-2">
            {/* Tasks Label */}
            <div className="gantt-month" style={{ width: '25%', fontWeight: 'bold', textAlign: 'center' }}>
              Tasks
            </div>
            
            {/* Month Labels */}
            {monthLabels.map((month, idx) => (
              <div key={idx} className="gantt-month">
                {month.toLocaleString('default', { month: 'short', year: 'numeric' })}
              </div>
            ))}
          </div>

          <div className="gantt-tasks position-relative" style={{ minHeight: tasks.length * 50 }}>
            {tasks.map((task, idx) => {
              const start = new Date(task.start_date || task.created_at).getTime();
              const end = new Date(task.due_date).getTime();
              const offsetPercent = getOffsetPercent(start);
              const durationPercent = getDurationPercent(start, end);

              return (
                <div
                  key={task.id}
                  className="gantt-task-row"
                  style={{
                    position: 'absolute',
                    top: idx * 50, // Ensuring proper spacing between tasks
                    width: '100%',
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 10,
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Task Name */}
                  <div className="gantt-task-name" style={{ width: '25%' }}>
                    {task.title}
                  </div>
                  
                  {/* Task Bar */}
                  <div
                    className="gantt-task-bar"
                    style={{
                      marginLeft: `${offsetPercent}%`,
                      width: `${durationPercent}%`,
                      height: 32,
                      backgroundColor: 'rgb(13 202 240)',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                    onMouseMove={(e) =>
                      setTooltip({
                        visible: true,
                        x: e.pageX + 10,
                        y: e.pageY + 10,
                        content: (
                          <div className="text-12">
                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                              {task.title}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'white' }}>
                              {new Date(start).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })} - 
                              {new Date(end).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        ),
                      })
                    }
                    onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                  />
                </div>
              );
            })}
            
            {/* Tooltip */}
            {tooltip.visible && (
              <div
                className="custom-tooltip"
                style={{
                  position: 'fixed',
                  top: tooltip.y,
                  left: tooltip.x,
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  color: '#fff',
                  padding: '5px 10px',
                  borderRadius: 5,
                  fontSize: 12,
                  pointerEvents: 'none',
                  zIndex: 9999,
                  whiteSpace: 'nowrap',
                }}
              >
                {tooltip.content}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProjectTimeline;
