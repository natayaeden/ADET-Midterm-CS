import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';

const IssueManagement = ({ projectId }) => {
  const [issues, setIssues] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    assigned_to: '',
    due_date: null,
    resolution_notes: '',
  });

  useEffect(() => {
    fetchIssues();
  }, [projectId]);

  const fetchIssues = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/issues`);
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const handleOpen = (issue = null) => {
    if (issue) {
      setSelectedIssue(issue);
      setFormData({
        ...issue,
        due_date: issue.due_date ? new Date(issue.due_date) : null,
      });
    } else {
      setSelectedIssue(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        assigned_to: '',
        due_date: null,
        resolution_notes: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedIssue(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedIssue) {
        await axios.put(`/api/projects/${projectId}/issues/${selectedIssue.id}`, formData);
      } else {
        await axios.post(`/api/projects/${projectId}/issues`, formData);
      }
      fetchIssues();
      handleClose();
    } catch (error) {
      console.error('Error saving issue:', error);
    }
  };

  const handleDelete = async (issueId) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await axios.delete(`/api/projects/${projectId}/issues/${issueId}`);
        fetchIssues();
      } catch (error) {
        console.error('Error deleting issue:', error);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Issue Management</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add Issue
        </Button>
      </Box>

      <Grid container spacing={2}>
        {issues.map((issue) => (
          <Grid item xs={12} md={6} key={issue.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6">{issue.title}</Typography>
                  <Box>
                    <Button size="small" onClick={() => handleOpen(issue)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(issue.id)}>
                      Delete
                    </Button>
                  </Box>
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  Priority: {issue.priority} | Status: {issue.status}
                </Typography>
                <Typography variant="body2">{issue.description}</Typography>
                {issue.resolution_notes && (
                  <Typography variant="body2" color="textSecondary">
                    Resolution: {issue.resolution_notes}
                  </Typography>
                )}
                <Typography variant="body2" color="textSecondary">
                  Reported by: {issue.reporter?.name}
                </Typography>
                {issue.assigned_to && (
                  <Typography variant="body2" color="textSecondary">
                    Assigned to: {issue.assignedUser?.name}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{selectedIssue ? 'Edit Issue' : 'Add Issue'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Resolution Notes"
                  value={formData.resolution_notes}
                  onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due Date"
                    value={formData.due_date}
                    onChange={(date) => setFormData({ ...formData, due_date: date })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedIssue ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IssueManagement; 