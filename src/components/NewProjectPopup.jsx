import React, { useState } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  TextField, 
  Button,
  Popover
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const NewProjectPopup = ({ anchorEl, onClose }) => {
  const [projectName, setProjectName] = useState('');
  const [projectUrl, setProjectUrl] = useState('https://');

  const handleSubmit = () => {
    // TODO: Handle project creation
    onClose();
  };

  const open = Boolean(anchorEl);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left',
      }}
    >
      <Paper sx={{ p: 2, width: '300px', bgcolor: '#f5f5f5' }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon sx={{ color: '#673ab7' }} />
          <Typography variant="h6">Nuovo Progetto</Typography>
        </Box>
        
        <TextField
          fullWidth
          label="Nuovo Progetto"
          variant="outlined"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          sx={{ mb: 2, bgcolor: '#fff' }}
        />
        
        <TextField
          fullWidth
          label="URL del Progetto"
          variant="outlined"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
          sx={{ mb: 2, bgcolor: '#fff' }}
        />

        <Button 
          fullWidth 
          variant="contained" 
          onClick={handleSubmit}
          sx={{ bgcolor: '#673ab7' }}
        >
          Aggiungi
        </Button>
      </Paper>
    </Popover>
  );
};

export default NewProjectPopup;
