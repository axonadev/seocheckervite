import React, { useState } from 'react';
import { Paper, Box, IconButton, Typography, Stack, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArticleIcon from '@mui/icons-material/Article';
import StorageIcon from '@mui/icons-material/Storage';
import NotesIcon from '@mui/icons-material/StickyNote2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NewProjectPopup from './NewProjectPopup';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { useDispatch } from 'react-redux';
import { logout } from '../store/storeLogin';

const SideMenu = ({ onProjectAdded }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNewProjectClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopup = () => {
    setAnchorEl(null);
  };

  const handleHomeClick = () => {

    navigate('/');
  };

  const handleArchiveClick = () => {

    navigate('/archive');
  };

  const handleAllNotesClick = () => {
    navigate('/all-notes');
  };

  const handleClientProductsArchiveClick = () => {
    navigate('/client-products-archive');
  };

  const handleProjectAdded = () => {
    if (onProjectAdded) {
      onProjectAdded();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('axo_token');
    sessionStorage.removeItem('axo_token');
    dispatch(logout());
    navigate('/login');
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
        justifyContent: 'space-between',
      }}
    >
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
          <Tooltip title="Aggiungi progetto" placement="right">
            <IconButton 
              sx={{ color: '#fff' }}
              onClick={handleNewProjectClick}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Homepage" placement="right">
            <IconButton sx={{ color: '#fff' }} onClick={handleHomeClick}>
              <ArticleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Archive" placement="right">
            <IconButton 
              sx={{ color: '#fff' }}
              onClick={handleArchiveClick}
            >
              <StorageIcon /> 
            </IconButton>
          </Tooltip>
          <Tooltip title="All Notes" placement="right">
            <IconButton 
              sx={{ color: '#fff' }}
              onClick={handleAllNotesClick}
            >
              <NotesIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Client Products" placement="right">
            <IconButton 
              sx={{ color: '#fff' }}
              onClick={handleClientProductsArchiveClick}
            >
              <ShoppingCartIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
        <Tooltip title="Logout" placement="right">
          <IconButton
            sx={{ color: '#fff' }}
            onClick={handleLogout}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <NewProjectPopup 
        anchorEl={anchorEl}
        onClose={handleClosePopup}
        onProjectAdded={handleProjectAdded}
      />
    </Paper>
  );
};

export default SideMenu;
