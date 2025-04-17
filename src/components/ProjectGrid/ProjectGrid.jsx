import React from 'react';
import { Grid } from '@mui/material';
import ProjectCard from '../ProjectCard/ProjectCard';

const ProjectGrid = ({ projects ,onProjectUpdate= ()=>{}}) => {
  return (
    <Grid 
      container 
      spacing={2}
      sx={{ 
      
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
          <ProjectCard project={project} onProjectUpdate = {onProjectUpdate} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProjectGrid;
