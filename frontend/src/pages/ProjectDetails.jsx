import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import axios from 'axios';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      setProject(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!project) {
    return <Typography>Project not found</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {project.name}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> {project.status}
              </Typography>
              <Typography variant="body1">
                <strong>Budget:</strong> ${project.budget}
              </Typography>
              <Typography variant="body1">
                <strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                <strong>Due Date:</strong> {new Date(project.due_date).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/projects/${project.id}/risks`}
                >
                  Risk & Issue Management
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  component={Link}
                  to={`/projects/${project.id}/tasks`}
                >
                  Task Management
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  component={Link}
                  to={`/projects/${project.id}/expenditures`}
                >
                  Expenditure Tracking
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Project Description
        </Typography>
        <Typography variant="body1">{project.description}</Typography>
      </Paper>
    </Container>
  );
};

export default ProjectDetails; 