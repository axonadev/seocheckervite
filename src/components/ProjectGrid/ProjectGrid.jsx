import React from 'react';
import { Grid, Container } from '@mui/material';
import ProjectCard from '../ProjectCard/ProjectCard';

const ProjectGrid = ({ projects }) => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        {projects.map((project, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProjectGrid;
