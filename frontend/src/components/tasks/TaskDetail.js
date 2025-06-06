import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './TaskDetail.css'; 

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expendituresLoading, setExpendituresLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [projectBudgetInfo, setProjectBudgetInfo] = useState({
    totalBudget: 0,
    allocatedBudget: 0,
    remainingBudget: 0
  });
  const [newExpenditure, setNewExpenditure] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    due_date: '',
    start_date: '',
    assigned_to: ''
  });
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchExpenditures = async (taskId) => {
    setExpendituresLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch task expenditures
      const expendituresResponse = await fetch(`http://localhost:8000/api/tasks/${taskId}/expenditures`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!expendituresResponse.ok) {
        throw new Error('Failed to fetch expenditures');
      }
      
      const expendituresData = await expendituresResponse.json();
      console.log('Fetched expenditures:', expendituresData);
      setExpenditures(expendituresData);
    } catch (error) {
      console.error('Error fetching expenditures:', error);
    } finally {
      setExpendituresLoading(false);
    }
  };

  const fetchTaskDetails = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const taskResponse = await fetch(`http://localhost:8000/api/tasks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!taskResponse.ok) {
        throw new Error('Task not found');
      }
      
      const taskData = await taskResponse.json();
      setTask(taskData);
      
      // Format the dates for the input fields (YYYY-MM-DD)
      let formattedDueDate = '';
      let formattedStartDate = '';
      if (taskData.due_date) {
        const d = new Date(taskData.due_date);
        formattedDueDate = d.toISOString().split('T')[0];
      }
      if (taskData.start_date) {
        const d = new Date(taskData.start_date);
        formattedStartDate = d.toISOString().split('T')[0];
      }
      // Always use string for assigned_to
      const assignedToValue = taskData.assigned_to
        ? (typeof taskData.assigned_to === 'object'
            ? String(taskData.assigned_to.id)
            : String(taskData.assigned_to))
        : '';
      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'To Do',
        priority: taskData.priority || 'Medium',
        due_date: formattedDueDate,
        start_date: formattedStartDate,
        assigned_to: assignedToValue
      });
      
      // Fetch project details
      const projectResponse = await fetch(`http://localhost:8000/api/projects/${taskData.project_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!projectResponse.ok) {
        throw new Error('Project not found');
      }
      
      const projectData = await projectResponse.json();
      // Format project dates
      const formattedProjectData = {
        ...projectData,
        start_date: projectData.start_date ? new Date(projectData.start_date).toISOString().split('T')[0] : '',
        due_date: projectData.due_date ? new Date(projectData.due_date).toISOString().split('T')[0] : ''
      };
      setProject(formattedProjectData);
      
      // Fetch all tasks for this project to calculate budget allocation
      const projectTasksResponse = await fetch(`http://localhost:8000/api/projects/${projectData.id}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (projectTasksResponse.ok) {
        const projectTasks = await projectTasksResponse.json();
        
        // Calculate the total allocated budget across all tasks
        const totalAllocatedBudget = projectTasks.reduce((sum, task) => {
          return sum + (parseFloat(task.budget) || 0);
        }, 0);
        
        // Calculate remaining project budget
        const projectBudget = parseFloat(projectData.budget) || 0;
        const remainingBudget = projectBudget - totalAllocatedBudget;
        
        setProjectBudgetInfo({
          totalBudget: projectBudget,
          allocatedBudget: totalAllocatedBudget,
          remainingBudget: remainingBudget
        });
      }
      
      // Fetch task comments
      const commentsResponse = await fetch(`http://localhost:8000/api/tasks/${id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!commentsResponse.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const commentsData = await commentsResponse.json();
      setComments(commentsData);
      
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    console.log('Task ID changed to:', id);
    if (id) {
      fetchUsers();
      fetchTaskDetails();
      fetchExpenditures(id);
    }
  }, [id, fetchTaskDetails]);

  useEffect(() => {
    // Fetch current user
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch('http://localhost:8000/api/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    fetchCurrentUser();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'start_date') {
      // Check if start date is within project date range
      if (project && project.start_date && value < project.start_date) {
        setUpdateError(`Task start date cannot be earlier than project start date (${new Date(project.start_date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric'})})`);
        return;
      }
      if (formData.due_date && value > formData.due_date) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          due_date: value 
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'due_date') {
      // Check if due date is within project date range
      if (project && project.due_date && value > project.due_date) {
        setUpdateError(`Task due date cannot be later than project due date (${new Date(project.due_date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric'})})`);
        return;
      }
      if (formData.start_date && value < formData.start_date) {
        setUpdateError('Due date cannot be earlier than start date');
        return;
      }
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    
    // Check if user has permission to edit this task
    if (!canModifyTask()) {
      setUpdateError('You do not have permission to edit this task. Only managers or the assigned member can edit tasks.');
      setIsEditing(false);
      return;
    }
    
    try {
      // Prepare the data to send to the API
      const dataToSubmit = {
        ...formData,
        assigned_to: formData.assigned_to === '' ? null : parseInt(formData.assigned_to, 10),
        due_date: formData.due_date || null,
        start_date: formData.start_date || null
      };
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSubmit)
      });      
      
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to update task');
      }
      
      const responseData = await response.json();
      setTask(responseData);
      setIsEditing(false);
      fetchTaskDetails(); 
    } catch (error) {
      setUpdateError(error.message || 'Failed to update task. Please try again.');
    }
  };

  const fetchComments = async () => {
    try {
        const response = await fetch(`/api/tasks/${id}/comments`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            setComments(data);
        } else {
            console.error('Failed to fetch comments');
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
};

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    try {
        const formData = new FormData();
        formData.append('comment', newComment);
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        const response = await fetch(`http://localhost:8000/api/tasks/${id}/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
        });

        if (response.ok) {
            await fetchComments();
            setNewComment('');
            setSelectedFile(null);
        } else {
            console.error('Failed to add comment');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
};

  const handleDelete = async () => {
    // Check if user has permission to delete this task
    if (!canModifyTask()) {
      alert('You do not have permission to delete this task. Only managers or the assigned member can delete tasks.');
      return;
    }
    
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

  // Format currency function
  const formatCurrency = (amount) => {
    if (!amount) return '₱0';
    return '₱' + parseFloat(amount).toLocaleString();
  };
  
  // Handle expenditure input changes
  const handleExpenditureChange = (e) => {
    const { name, value } = e.target;
    setNewExpenditure({
      ...newExpenditure,
      [name]: value
    });
  };
  
  // Add new expenditure
  const handleAddExpenditure = async (e) => {
    e.preventDefault();
    if (!newExpenditure.amount || !newExpenditure.description) return;
    
    // Check if user has permission to add expenditures
    if (!canModifyTask()) {
      alert('You do not have permission to add expenditures to this task. Only managers or the assigned member can add expenditures.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const expenditureData = {
        task_id: id,
        description: newExpenditure.description,
        amount: parseFloat(newExpenditure.amount),
        date: newExpenditure.date
      };
      
      const response = await fetch('http://localhost:8000/api/task-expenditures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenditureData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add expenditure');
      }
      
      // Reset form
      setNewExpenditure({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      // Refresh expenditures
      fetchExpenditures(id);
    } catch (error) {
      console.error('Error adding expenditure:', error);
    }
  };
  
  // Calculate total expenditures
  const totalExpenditure = expenditures.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // Delete an expenditure
  const handleDeleteExpenditure = async (expenditureId) => {
    // Check if user has permission to delete expenditures
    if (!canModifyTask()) {
      alert('You do not have permission to delete expenditures from this task. Only managers or the assigned member can delete expenditures.');
      return;
    }
    
    const confirm = window.confirm('Are you sure you want to delete this expenditure?');
    
    if (confirm) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/task-expenditures/${expenditureId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          // Refresh expenditures
          fetchExpenditures(id);
        }
      } catch (error) {
        console.error('Error deleting expenditure:', error);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/task-comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchComments();
      } else {
        alert('Failed to delete comment');
      }
    } catch (error) {
      alert('Error deleting comment');
    }
  };

  // Check if user is a manager
  const isManager = currentUser?.role === 'manager';
  
  // Check if current user is assigned to this task
  const isAssignedToTask = () => {
    if (!currentUser || !task) return false;
    
    // If user is a manager, they always have access
    if (isManager) return true;
    
    // For members, check if they are assigned to this task
    const taskAssigneeId = typeof task.assigned_to === 'object' && task.assigned_to 
      ? task.assigned_to.id
      : typeof task.assigned_to === 'number' || (task.assigned_to && !isNaN(Number(task.assigned_to)))
        ? Number(task.assigned_to)
        : null;
    
    return taskAssigneeId === currentUser.id;
  };
  
  // Check if the current user can edit/delete this task
  const canModifyTask = () => {
    return isManager || isAssignedToTask();
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  if (!task || !project) {
    return <div className="alert alert-danger">Task or project not found</div>;
  }

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      case 'Under Review': return 'info';
      default: return 'secondary';
    }
  };

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
            ) : canModifyTask() ? (
              <>
                <button onClick={() => setIsEditing(true)} className="btn btn-outline-primary me-2">
                  <i className="bi bi-pencil me-1"></i>Edit
                </button>
                <button onClick={handleDelete} className="btn btn-outline-danger">
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
              </>
            ) : (
              <div className="text-muted">
                <small><i className="bi bi-info-circle me-1"></i>You can only view this task</small>
              </div>
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
                  <label htmlFor="start_date" className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    min={project?.start_date}
                    max={project?.due_date}
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="due_date" className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    min={formData.start_date || project?.start_date}
                    max={project?.due_date}
                    required
                  />
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="assigned_to" className="form-label">Assigned To</label>
                  <select
                    className="form-select"
                    id="assigned_to"
                    name="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleInputChange}
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          ) : (
            <>
              {/* transform h2 to uppercase */}

              <h2 className="card-title">{task.title.toUpperCase()}</h2> 
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
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Assigned To
                      <span>{
                        typeof task.assigned_to === 'object' && task.assigned_to
                          ? task.assigned_to.name
                          : typeof task.assigned_to === 'number' || (task.assigned_to && !isNaN(Number(task.assigned_to)))
                            ? (users.find(user => user.id === Number(task.assigned_to))?.name || 'Unknown User') 
                            : 'Unassigned'
                      }</span>
                    </li>
                  </ul>
                </div>
                
                <div className="col-md-6">
                  <ul className="list-group">                    
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Start Date
                      <span>{task.start_date ? new Date(task.start_date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric'}) : 'Not set'}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Due Date
                      <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric'}) : 'Not set'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
            
      {/* Task Expenditures Section */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            Task Expenditures
            <button 
              onClick={() => fetchExpenditures(id)} 
              className="btn btn-sm btn-outline-secondary ms-2"
              disabled={expendituresLoading}
            >
              <i className={`bi ${expendituresLoading ? 'bi-arrow-repeat spin' : 'bi-arrow-clockwise'}`}></i>
            </button>
          </h4>
        </div>
        
        <div className="card-body">
          {/* Add Expenditure Form - Only show if user can modify task */}
          {canModifyTask() && (
            <form onSubmit={handleAddExpenditure} className="mb-4">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="amount" className="form-label">Amount (₱)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      name="amount"
                      value={newExpenditure.amount}
                      onChange={handleExpenditureChange}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="expDescription" className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      id="expDescription"
                      name="description"
                      value={newExpenditure.description}
                      onChange={handleExpenditureChange}
                      placeholder="Enter expense description"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="date" className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="date"
                      name="date"
                      value={newExpenditure.date}
                      onChange={handleExpenditureChange}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <button 
                    type="submit" 
                    className="btn btn-primary float-end"
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Add Expenditure
                  </button>
                </div>
              </div>
            </form>
          )}
          
          {!canModifyTask() && (
            <div className="alert alert-info mb-4">
              <i className="bi bi-info-circle me-2"></i>
              You can only view expenditures for this task. Only the task assignee or a manager can add/delete expenditures.
            </div>
          )}

          {/* Expenditures List */}
          {expendituresLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2">Loading expenditures...</p>
            </div>
          ) : expenditures.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-receipt fs-1 d-block mb-2"></i>
              <p>No expenditures recorded yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Date</th>
                    <th className="text-end">Amount</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.map(exp => (
                    <tr key={exp.id}>
                      <td>{exp.description}</td>
                      <td>{new Date(exp.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric'})}</td>
                      <td className="text-end text-primary fw-bold">{formatCurrency(exp.amount)}</td>
                      <td className="text-center">
                        {canModifyTask() && (
                          <button 
                            onClick={() => handleDeleteExpenditure(exp.id)} 
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="table-light">
                    <td colSpan="2" className="fw-bold">Total</td>
                    <td className="text-end fw-bold">{formatCurrency(totalExpenditure)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>      
      
      {/* Comments Section */}
      <div className="card my-4">
        <div className="card-header">
            <h4>Comments</h4>
        </div>
        <ul className="list-group list-group-flush">
            {comments.map((comment) => (
                <li key={comment.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>{comment.user.name}</strong>
                            <p className="mb-1">{comment.comment}</p>
                        </div>
                        <div className="text-end">
                            <span className="text-muted d-block">{new Date(comment.created_at).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                            {currentUser && comment.user && currentUser.id === comment.user.id && (
                                <button
                                    className="btn btn-sm btn-danger mt-2"
                                    onClick={() => handleDeleteComment(comment.id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                    {comment.file_path && (
                        <div className="mt-2">
                            <a
                                href={`http://localhost:8000/storage/${comment.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                            >
                                <i className="bi bi-paperclip me-1"></i>
                                {comment.file_name}
                            </a>
                        </div>
                    )}
                </li>
            ))}
        </ul>
        <div className="card-body">
            <form onSubmit={handleCommentSubmit}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="form-control mb-3"
                    placeholder="Add a comment"
                ></textarea>
                <div className="mb-3">
                    <label htmlFor="file" className="form-label text-muted">Attach File (maximum size: 5MB)</label>
                    <input
                        type="file"
                        className="form-control"
                        id="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
