import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Popover,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; // Changed icon
import useEnv from '../hooks/useEnv';
import { Scrivi } from '../utility/callFetch'; // Assuming Scrivi handles updates

const EditProjectPopup = ({ project, anchorEl, onClose, onProjectUpdated }) => {
  const [projectName, setProjectName] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { SERVERAPI } = useEnv();
  const token = localStorage.getItem("axo_token");
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (project) {
      setProjectName(project.ProgettiSerp_Nome || '');
      setProjectUrl(project.ProgettiSerp_DNS || '');
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      setSnackbar({ open: true, message: 'Inserisci il nome del progetto', severity: 'error' });
      return;
    }
    if (!projectUrl.trim()) {
      setSnackbar({ open: true, message: 'Inserisci un URL valido', severity: 'error' });
      return;
    }
    if (!project || !project.IDOBJ) {
        setSnackbar({ open: true, message: 'ID Progetto non valido', severity: 'error' });
        return;
    }

    setLoading(true);
    try {
      const updatedProjectData = {
        ProgettiSerp_Nome: projectName,
        ProgettiSerp_DNS: projectUrl,
        // Include other fields if necessary, or let the backend handle defaults
      };

      const apiUrl = `${SERVERAPI}/api/axo_sel`; // Use the same endpoint as Scrivi expects
      const response = await Scrivi(apiUrl, token, project.IDOBJ, "progettiserp", "progettiserpsel", updatedProjectData);

      console.log("Project update response:", response);

      if (response && (response.Errore || response.stato === 'KO')) {
         throw new Error(response.Errore || 'Errore durante l\'aggiornamento del progetto');
      }

      setSnackbar({ open: true, message: 'Progetto aggiornato con successo!', severity: 'success' });
      if (onProjectUpdated) {
        // Pass the updated data back
        onProjectUpdated({ ...project, ...updatedProjectData });
      }
      onClose(); // Close the popover on success

    } catch (error) {
      console.error('Error updating project:', error);
      setSnackbar({
        open: true,
        message: `Errore: ${error.message || 'Si è verificato un problema'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, width: '300px', bgcolor: '#f5f5f5' }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
             <IconButton sx={{ backgroundColor: '#673ab7', color: 'white', p: '4px' }}>
               <EditIcon fontSize="small" />
             </IconButton>
            <Typography variant="h6">Modifica Progetto</Typography>
          </Box>

          <TextField
            fullWidth
            label="Modifica Progetto" // Changed label
            variant="filled" // Changed variant
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={loading}
            sx={{ mb: 1, bgcolor: '#fff' }} // Adjusted margin
            InputProps={{ disableUnderline: true }} // Added to match image style
          />

          <TextField
            fullWidth
            label="URL del Progetto"
            variant="filled" // Changed variant
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            disabled={loading}
            sx={{ mb: 2, bgcolor: '#fff' }}
            InputProps={{ disableUnderline: true }} // Added to match image style
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EditIcon />} // Changed icon
            sx={{ bgcolor: '#673ab7', borderRadius: '16px' }} // Added border radius
          >
            {loading ? 'Modifica in corso...' : 'Modifica'}
          </Button>
        </Paper>
      </Popover>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditProjectPopup;
