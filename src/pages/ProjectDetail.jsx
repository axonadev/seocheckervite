import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Layout from '../layout/Layout';

const ProjectDetail = () => {
  const { id } = useParams();

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="body1">Project ID: {id}</Typography>
        {/* Content for the specific project will go here */}
      </Box>
    </Layout>
  );
};

export default ProjectDetail;
