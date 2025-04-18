import React, { useState } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  TextField, 
  Button,
  Popover,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import useEnv from '../hooks/useEnv';
import { useNavigate } from 'react-router-dom';

const NewProjectPopup = ({ anchorEl, onClose, onProjectAdded }) => {
  const [projectName, setProjectName] = useState('');
  const [projectUrl, setProjectUrl] = useState('https://');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const navigate = useNavigate();
  const { SERVERAPI } = useEnv();
  const token = localStorage.getItem("axo_token");
  const open = Boolean(anchorEl);

  const handleSubmit = async () => {
    // Validation
    if (!projectName.trim()) {
      setSnackbar({
        open: true,
        message: 'Inserisci il nome del progetto',
        severity: 'error'
      });
      return;
    }

    if (!projectUrl.trim() || projectUrl === 'https://') {
      setSnackbar({
        open: true,
        message: 'Inserisci un URL valido',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Prepare project data - Make sure structure matches API expectations
      const newProject = {
        ProgettiSerp_Nome: projectName,
        ProgettiSerp_DNS: projectUrl,
        ProgettiSerp_Stato: 1, // Active status
        dataInserimento: new Date().toISOString()
      };

      console.log("Creating project with data:", newProject);
      
      // Try direct fetch instead of using the Scrivi function
      const apiUrl = `${SERVERAPI}/api/axo_sel`;
      console.log("Using API URL:", apiUrl);
      console.log("Using token:", token ? "Token exists" : "No token");
      
      // Prepare request body based on the Scrivi function parameters
      const requestBody = {
        Token: token,
        IDOBJ: 0, // IDOBJ 0 for new records
        DB: "progettiserp",
        Modulo: "progettiserp",
        Classe: "progettiserpsel",
        Item: ` {progettiserp:[${JSON.stringify(newProject)}]} ` // Format matches the Scrivi function
      };

      // Set up a controller for request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
      
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Project creation direct response:", data);
        console.log("Full response structure:", JSON.stringify(data, null, 2));
        
        if (data && data.Errore) {
          throw new Error(data.Errore);
        }
        
        setSnackbar({
          open: true,
          message: 'Progetto creato con successo!',
          severity: 'success'
        });
        
        // Reset form fields
        setProjectName('');
        setProjectUrl('https://');
        
        // Notify parent component that a project was added
        if (onProjectAdded) {
          onProjectAdded();
        }
        
        // Get the new project ID
        let projectId = null;
        
        if (data && typeof data.IDOBJ !== 'undefined') {
          projectId = data.IDOBJ;
          console.log("Found project ID in data.IDOBJ:", projectId);
        } else if (data && data.Item && data.Item[0] && typeof data.Item[0].IDOBJ !== 'undefined') {
          projectId = data.Item[0].IDOBJ;
          console.log("Found project ID in data.Item[0].IDOBJ:", projectId);
        } else if (data && data.Itemset && data.Itemset.v_progettiserp && data.Itemset.v_progettiserp[0] && typeof data.Itemset.v_progettiserp[0].IDOBJ !== 'undefined') {
          projectId = data.Itemset.v_progettiserp[0].IDOBJ;
          console.log("Found project ID in data.Itemset.v_progettiserp[0].IDOBJ:", projectId);
        }
        
        // Close the popup
        onClose();
        
        // Navigate to the newly created project detail page after a small delay to allow UI updates to complete
        if (projectId) {
          // Wait a moment to ensure all state updates are applied before navigation
          window.setTimeout(() => {
            console.log(`Navigating to /projects/${projectId}`);
            navigate(`/projects/${projectId}`, { replace: true });
          }, 300);
        } else {
          console.error("Could not find project ID in response");
          // Fallback: just go to the projects list
          window.setTimeout(() => {
            navigate('/');
          }, 300);
        }
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('La richiesta è scaduta. Il server non ha risposto in tempo.');
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setSnackbar({
        open: true,
        message: `Errore: ${error.message || 'Si è verificato un problema durante la creazione del progetto'}`,
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
            label="Nome Progetto"
            variant="outlined"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={loading}
            sx={{ mb: 2, bgcolor: '#fff' }}
          />
          
          <TextField
            fullWidth
            label="URL del Progetto"
            variant="outlined"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            disabled={loading}
            sx={{ mb: 2, bgcolor: '#fff' }}
          />

          <Button 
            fullWidth 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
            sx={{ bgcolor: '#673ab7' }}
          >
            {loading ? 'Creazione in corso...' : 'Aggiungi Progetto'}
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

export default NewProjectPopup;
