  // components/tasks/NewTask.js
  import React, { useState, useEffect } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';

  const NewTask = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      assigned_to: '',
      status: 'To Do',
      priority: 'Medium',
      due_date: '',
      estimated_hours: ''
    });

    useEffect(() => {
      fetchUsers();
    }, []);

    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');

      const dataToSend = {
        ...formData,
        project_id: projectId // ✅ Required by Laravel validation
      };

      try {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          navigate(`/projects/${projectId}/tasks`);
        } else {
          const errorData = await response.json();
          console.error('Error creating task:', errorData);
          alert(`Failed to create task:\n${JSON.stringify(errorData.errors, null, 2)}`);
        }
      } catch (error) {
        console.error('Error creating task:', error);
      }
    };

    return (
      <div className="container mt-4">
        <h2>Create New Task</h2>
        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Assigned To</label>
            <select
              name="assigned_to"
              className="form-select"
              value={formData.assigned_to}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Priority</label>
            <select
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              name="due_date"
              className="form-control"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Estimated Hours</label>
            <input
              type="number"
              name="estimated_hours"
              className="form-control"
              value={formData.estimated_hours}
              onChange={handleChange}
              min="0"
            />
          </div>

          <button type="submit" className="btn btn-primary">Create Task</button>
        </form>
      </div>
    );
  };

  export default NewTask;
