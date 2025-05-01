import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

const statusColors = {
  'To Do': '#8884d8',
  'In Progress': '#82ca9d',
  'Under Review': '#ffc658',
  'Completed': '#0088FE',
};

const ProjectGanttChart = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        // Map tasks to chart data with duration in days
        const chartData = data.map(task => {
          const start = new Date(task.start_date || task.created_at);
          const end = new Date(task.due_date || task.start_date || task.created_at);
          const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          return {
            name: task.title,
            duration,
            status: task.status,
          };
        });
        setTasks(chartData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId]);

  if (loading) return <div>Loading Gantt chart...</div>;
  if (error) return <div>Error loading Gantt chart: {error}</div>;

  return (
    <div>
      <h3>Project Progress (Task Durations)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={tasks}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <XAxis type="number" label={{ value: 'Duration (days)', position: 'insideBottomRight', offset: -10 }} />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey="duration" name="Duration (days)">
            {tasks.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#8884d8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectGanttChart;
