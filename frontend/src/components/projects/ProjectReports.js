import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ProjectReports = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [taskProgress, setTaskProgress] = useState(null);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectResponse, budgetResponse, tasksResponse] = await Promise.all([
        axios.get(`/api/projects/${projectId}`),
        axios.get(`/api/projects/${projectId}/budget`),
        axios.get(`/api/projects/${projectId}/tasks`),
      ]);

      setProjectData(projectResponse.data);
      setBudgetData(budgetResponse.data);
      
      // Calculate task progress
      const tasks = tasksResponse.data;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
      const notStartedTasks = tasks.filter(task => task.status === 'not_started').length;

      setTaskProgress({
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        notStarted: notStartedTasks,
        percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching project data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const taskProgressData = [
    { name: 'Completed', value: taskProgress.completed },
    { name: 'In Progress', value: taskProgress.inProgress },
    { name: 'Not Started', value: taskProgress.notStarted },
  ];

  const budgetChartData = [
    { name: 'Planned', value: budgetData.planned_budget },
    { name: 'Spent', value: budgetData.spent_budget },
    { name: 'Remaining', value: budgetData.planned_budget - budgetData.spent_budget },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Project Reports
      </Typography>

      <Grid container spacing={3}>
        {/* Task Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Progress
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Overall Progress: {taskProgress.percentage.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={taskProgress.percentage}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskProgressData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {taskProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Overview
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box mt={2}>
                <Typography variant="body2">
                  Planned Budget: ${budgetData.planned_budget.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Spent: ${budgetData.spent_budget.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Remaining: ${(budgetData.planned_budget - budgetData.spent_budget).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1">Project Details</Typography>
                  <Typography variant="body2">Name: {projectData.name}</Typography>
                  <Typography variant="body2">Status: {projectData.status}</Typography>
                  <Typography variant="body2">
                    Start Date: {new Date(projectData.start_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    End Date: {new Date(projectData.end_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1">Task Statistics</Typography>
                  <Typography variant="body2">Total Tasks: {taskProgress.total}</Typography>
                  <Typography variant="body2">Completed: {taskProgress.completed}</Typography>
                  <Typography variant="body2">In Progress: {taskProgress.inProgress}</Typography>
                  <Typography variant="body2">Not Started: {taskProgress.notStarted}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1">Budget Statistics</Typography>
                  <Typography variant="body2">
                    Budget Utilization: {((budgetData.spent_budget / budgetData.planned_budget) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">
                    Average Cost per Task: $
                    {(budgetData.spent_budget / taskProgress.total).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectReports; 