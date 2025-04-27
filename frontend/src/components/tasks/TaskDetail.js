// components/tasks/TaskDetail.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    due_date: '',
    assigned_to: ''
  });
  const [newComment, setNewComment] = useState('');
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch task details
      const taskResponse = await fetch(`http://localhost:8000/api/tasks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!taskResponse.ok) {
        throw new Error('Task not found');
      }
      
      const taskData = await taskResponse.json();
      setTask(taskData);
      
      // Format the date properly for the input field
      let formattedDate = '';
      if (taskData.due_date) {
        // Handle different date formats that might come from the API
        formattedDate = taskData.due_date.includes('T') 
          ? taskData.due_date.split('T')[0] 
          : taskData.due_date;
      }
      
      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'To Do',
        priority: taskData.priority || 'Medium',
        due_date: formattedDate,
        assigned_to: taskData.assigned_to || '',
        estimated_hours: taskData.estimated_hours || ''
      });
      
      // Fetch project details
      const projectResponse = await fetch(`http://localhost:8000/api/projects/${taskData.project_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const projectData = await projectResponse.json();
      setProject(projectData);
      
      // Fetch task comments
      const commentsResponse = await fetch(`http://localhost:8000/api/tasks/${id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const commentsData = await commentsResponse.json();
      setComments(commentsData);
      
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    
    try {
      // Log data before sending for debugging
      console.log("Sending update with data:", formData);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      // Get the full response for better error handling
      const responseText = await response.text();
      console.log("Raw server response:", responseText);
      
      let responseData;
      try {
        // Try to parse as JSON if possible
        responseData = JSON.parse(responseText);
      } catch (e) {
        // Not valid JSON, use raw text
        responseData = { message: responseText };
      }
      
      if (!response.ok) {
        const errorMessage = responseData.message || 
                             responseData.error || 
                             `Server returned ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      console.log("Task updated successfully:", responseData);
      
      // Update task state with the returned data
      setTask(responseData);
      setIsEditing(false);
      
      // Refresh to get the latest data
      fetchTaskDetails();
    } catch (error) {
      console.error('Error updating task:', error);
      setUpdateError(error.message || 'Failed to update task. Please try again.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/tasks/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });
      
      if (response.ok) {
        const commentData = await response.json();
        setComments([...comments, commentData]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm('Are you sure you want to delete this task?');
    
    if (confirm) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/tasks/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          navigate(`/projects/${project.id}/tasks`);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  if (!task || !project) {
    return <div className="alert alert-danger">Task or project not found</div>;
  }

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      case 'Under Review': return 'info';
      default: return 'secondary'; // To Do
    }
  };

  // Helper function to get priority badge color
  const getPriorityBadgeColor = (priority) => {
    switch(priority) {
      case 'Urgent': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'primary';
      default: return 'info'; // Low
    }
  };

  return (
    <div className="task-detail">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/projects">Projects</Link></li>
          <li className="breadcrumb-item"><Link to={`/projects/${project.id}`}>{project.title}</Link></li>
          <li className="breadcrumb-item"><Link to={`/projects/${project.id}/tasks`}>Tasks</Link></li>
          <li className="breadcrumb-item active">{task.title}</li>
        </ol>
      </nav>
      
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Task Details</h4>
          <div>
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="btn btn-outline-secondary me-2">
                  Cancel
                </button>
                <button form="task-form" type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="btn btn-outline-primary me-2">
                  <i className="bi bi-pencil me-1"></i>Edit
                </button>
                <button onClick={handleDelete} className="btn btn-outline-danger">
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="card-body">
          {updateError && (
            <div className="alert alert-danger mb-3">{updateError}</div>
          )}
          
          {isEditing ? (
            <form id="task-form" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select
                    className="form-select"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="due_date" className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="estimated_hours" className="form-label">Estimated Hours</label>
                  <input
                    type="number"
                    className="form-control"
                    id="estimated_hours"
                    name="estimated_hours"
                    value={formData.estimated_hours}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    placeholder="Estimated hours to complete"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="assigned_to" className="form-label">Assigned To</label>
                <input
                  type="text"
                  className="form-control"
                  id="assigned_to"
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                  placeholder="Enter user ID or leave blank for unassigned"
                />
              </div>
            </form>
          ) : (
            <>
              <h2 className="card-title">{task.title}</h2>
              <p className="card-text">{task.description || 'No description provided.'}</p>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <ul className="list-group">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Status
                      <span className={`badge bg-${getStatusBadgeColor(task.status)}`}>
                        {task.status}
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Priority
                      <span className={`badge bg-${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="col-md-6">
                  <ul className="list-group">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Due Date
                      <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Estimated Hours
                      <span>{task.estimated_hours || 'Not estimated'}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Assigned To
                      <span>{task.assigned_to || 'Unassigned'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Comments ({comments.length})</h5>
        </div>
        <div className="card-body">
          {comments.length === 0 ? (
            <p className="text-muted">No comments yet.</p>
          ) : (
            <div className="comment-list mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="d-flex mb-3">
                  <div className="flex-shrink-0">
                    <div className="avatar bg-light text-primary rounded-circle p-2 me-2">
                      <i className="bi bi-person-fill"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="d-flex justify-content-between">
                      <h6 className="mb-0">{comment.user_name}</h6>
                      <small className="text-muted">{new Date(comment.created_at).toLocaleString()}</small>
                    </div>
                    <p className="mb-0">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit}>
            <div className="mb-3">
              <label htmlFor="comment" className="form-label">Add a comment</label>
              <textarea
                className="form-control"
                id="comment"
                rows="2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-chat-dots me-1"></i>
              Add Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;