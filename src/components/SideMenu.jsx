import React, { useState } from 'react';
import { Paper, Box, IconButton, Typography, Stack } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArticleIcon from '@mui/icons-material/Article';
import StorageIcon from '@mui/icons-material/Storage';
import NewProjectPopup from './NewProjectPopup';

const SideMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleNewProjectClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopup = () => {
    setAnchorEl(null);
  };

  return (
    <Paper
      sx={{
        width: '60px',
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: 0,
        backgroundColor: "#6750A4",
        color: "#fff",
        boxShadow: "none",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        py: 2,
      }}
    >
      {/* Top section with logo and globe */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        width: '100%',
        mb: 2
      }}>
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 1,
          mb: 2
        }}>
          <IconButton 
            sx={{ 
              color: '#fff',
              padding: '4px'
            }}
          >
            <LanguageIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ pr: 1 }}>SC</Typography>
        </Box>

        <Stack 
          spacing={2} 
          alignItems="center"
        >
          <IconButton 
            sx={{ color: '#fff' }}
            onClick={handleNewProjectClick}
          >
            <AddCircleOutlineIcon />
          </IconButton>
          <IconButton sx={{ color: '#fff' }}>
            <ArticleIcon />
          </IconButton>
          <IconButton sx={{ color: '#fff' }}>
            <StorageIcon />
          </IconButton>
        </Stack>
      </Box>

      <NewProjectPopup 
        anchorEl={anchorEl}
        onClose={handleClosePopup}
      />
    </Paper>
  );
};

export default SideMenu;
