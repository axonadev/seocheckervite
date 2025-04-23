import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, Stack, Snackbar, Alert, Modal, CircularProgress, IconButton } from '@mui/material';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UpdateIcon from '@mui/icons-material/Update';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TagIcon from '@mui/icons-material/Tag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { FormatDate } from '../../utility/FormatDate';
import useEnv from '../../hooks/useEnv';
import { Fai, Scrivi } from '../../utility/callFetch';
import { Link, useNavigate } from 'react-router-dom';

const ProjectCard = ({ project, onProjectUpdate = () => {} }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
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
  const lastReportDate = project.dataEstrazione || project.ProgettiSerp_UltimoReport || project.dataKeyword || project.dataInserimento;

  const handleArchiveProject = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (!project.IDOBJ) {
      setSnackbar({ open: true, message: "ID progetto non valido", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      const apiUrl = `${SERVERAPI}/api/axo_sel`;
      const UpdPj = { IDOBJ: project.IDOBJ, ProgettiSerp_Stato: 2 };
      const response = await Scrivi(apiUrl, token, project.IDOBJ, "progettiserp", "progettiserpsel", UpdPj);
      onProjectUpdate(project.IDOBJ);
    } catch (error) {
      console.error("Error archiving project:", error);
      setSnackbar({ open: true, message: `Errore archiviazione: ${error.message}`, severity: "error" });
    } finally {
      setOpenMessaggioArchivio(false);
      setLoading(false);
    }
  };

  const handleUpdateClick = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (!project.IDOBJ || isUpdating || loading) return;

    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);
    } catch (error) {
      console.error("Error updating project:", error);
      setSnackbar({ open: true, message: `Errore aggiornamento: ${error.message}`, severity: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenArchiveModal = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setOpenMessaggioArchivio(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCardClick = (event) => {
    if (project.IDOBJ) {
      // Check for modifier keys to open in a new tab
      if (event.ctrlKey || event.metaKey) {
        window.open(`/projects/${project.IDOBJ}`, '_blank');
      } else {
        navigate(`/projects/${project.IDOBJ}`);
      }
    }
  };

  return (
    <>
      <Card
        sx={{
          minWidth: 275,
          m: 1,
          borderRadius: 3,
          boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
          }
        }}
        onClick={handleCardClick}
      >
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
                Ultimo Report: {lastReportDate ? FormatDate(lastReportDate, 'dd/MM/yyyy') : 'N/A'}
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

          <Box display="flex" gap={1} alignItems="center">
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArchiveOutlinedIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                flex: 1,
              }}
              onClick={handleOpenArchiveModal}
              disabled={loading || isUpdating}
            >
              Archivia
            </Button>
            <Button
              variant="outlined"
              startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <UpdateIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                flex: 1,
              }}
              onClick={handleUpdateClick}
              disabled={loading || isUpdating}
            >
              Aggiorna
            </Button>
            {updateSuccess && (
              <IconButton size="small" sx={{ color: 'success.main', p: 0, ml: 0.5 }}>
                <CheckCircleIcon />
              </IconButton>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Modal onClose={() => setOpenMessaggioArchivio(false)} open={openMessaggioArchivio}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          padding: 4,
          borderRadius: 2,
          boxShadow: 24,
          textAlign: 'center',
          minWidth: 300
        }}>
          <Typography variant="h6" gutterBottom fontWeight="600">
            Sei sicuro di voler archiviare il progetto?
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" mt={2}>
            <Button variant="contained" onClick={handleArchiveProject} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Conferma'}
            </Button>
            <Button variant="outlined" onClick={() => setOpenMessaggioArchivio(false)} disabled={loading}>
              Annulla
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProjectCard;
