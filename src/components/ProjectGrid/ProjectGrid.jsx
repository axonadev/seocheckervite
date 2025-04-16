import React from 'react';
import { Grid } from '@mui/material';
import ProjectCard from '../ProjectCard/ProjectCard';

const ProjectGrid = ({ projects }) => {
  return (
    <Grid 
      container 
      spacing={2}
      sx={{ 
        mt: -15, // Small margin top from search bar
        ml: -15, //
        width: 'calc(100% - 10px)' // Ensure proper width accounting for padding
      }}
    >
      {projects.map((project, index) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={4} 
          lg={3} 
          key={index}
        >
          <ProjectCard project={project} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProjectGrid;
