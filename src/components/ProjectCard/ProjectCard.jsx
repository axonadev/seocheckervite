import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, Stack, Snackbar, Alert, Modal } from '@mui/material';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UpdateIcon from '@mui/icons-material/Update';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TagIcon from '@mui/icons-material/Tag';
import {FormatDate} from '../../utility/FormatDate';
import useEnv from '../../hooks/useEnv';
import { Fai, Scrivi } from '../../utility/callFetch';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project, onProjectUpdate=()=>{} }) => {
  const [loading, setLoading] = useState(false);
  const [openMessaggioArchivio, setOpenMessaggioArchivio] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const { SERVERAPI } = useEnv();
  const token = localStorage.getItem("axo_token");

  const domainToDisplay = project.ProgettiSerp_DNS || project.domain || "No domain";
  const keywordCount = project.totaleKeyword || project.keywords || 0;

  const handleArchiveProject = async (event) => {
    event.stopPropagation();
    if (!project.IDOBJ) {
      setSnackbar({
        open: true,
        message: "ID progetto non valido",
        severity: "error"
      });
      return;
    }
    
    setLoading(true);

    const apiUrl = `${SERVERAPI}/api/axo_sel`;

    const UpdPj = {
      IDOBJ: project.IDOBJ,
      ProgettiSerp_Stato: 2,
    };

    const response = await Scrivi(apiUrl, token, project.IDOBJ, "progettiserp", "progettiserpsel", UpdPj);

    setOpenMessaggioArchivio(false);
    setLoading(false);

    onProjectUpdate(project.IDOBJ);
  };

  const handleUpdateClick = (event) => {
    event.stopPropagation();
    console.log("Update clicked for project:", project.IDOBJ);
  };

  const handleOpenArchiveModal = (event) => {
    event.stopPropagation();
    setOpenMessaggioArchivio(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Link to={`/projects/${project.IDOBJ}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Card sx={{ 
          minWidth: 275, 
          m: 1,
          borderRadius: 3,
          boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
              {project.ProgettiSerp_Nome || "Unnamed Project"}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <LanguageIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
              <Typography color="text.secondary" variant="body2">
                {domainToDisplay}
              </Typography>
            </Box>

            <Stack spacing={1.5} mb={3}>
              <Box display="flex" alignItems="center">
                <AccessTimeIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  Ultimo Report: {FormatDate(project.ProgettiSerp_UltimoReport || project.dataKeyword || new Date(), 'dd/MM/yyyy')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <TagIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                <Chip 
                  label={`${keywordCount} keywords`}
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: 'primary.main',
                  }}
                />
              </Box>
            </Stack>

            <Box display="flex" gap={2}>
              <Button 
                variant="contained" 
                startIcon={<ArchiveOutlinedIcon />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  flex: 1,
                }}
                onClick={handleOpenArchiveModal}
                disabled={loading}
              >
                Archivia
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<UpdateIcon />}
                sx={{
                  textTransform: 'none',  
                  borderRadius: 2,
                  flex: 1,
                }}
                onClick={handleUpdateClick}
              >
                Aggiorna
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Link>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Modal onClose={() => setOpenMessaggioArchivio(false)} open={openMessaggioArchivio}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh', 
          backgroundColor: 'rgba(0, 0, 0, 0.5)' 
        }}>
          <Box sx={{ 
            backgroundColor: '#fff', 
            padding: 4, 
            borderRadius: 2, 
            boxShadow: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Sei sicuro di voler archiviare il progetto?
            </Typography>
            <Box display="flex" gap={2} justifyContent="center" mt={2}>
              <Button variant="contained" onClick={handleArchiveProject} disabled={loading}>
                Conferma
              </Button>
              <Button variant="outlined" onClick={(e) => { e.stopPropagation(); setOpenMessaggioArchivio(false); }} disabled={loading}>
                Annulla
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProjectCard;
