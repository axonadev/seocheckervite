import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  Snackbar,
  Alert,
  Modal,
  CircularProgress,
  IconButton,
  CardMedia,
  Skeleton,
  TextField,
} from "@mui/material";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UpdateIcon from "@mui/icons-material/Update";
import LanguageIcon from "@mui/icons-material/Language";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TagIcon from "@mui/icons-material/Tag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import { FormatDate } from "../../utility/FormatDate";
import useEnv from "../../hooks/useEnv";
import { Fai, Scrivi } from "../../utility/callFetch";
import { Link, useNavigate } from "react-router-dom";

const ProjectCard = ({ project, onProjectUpdate = () => {} }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(
    project.ProgettiSerp_Stato === 10
  );
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [openMessaggioArchivio, setOpenMessaggioArchivio] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [autoSend, setAutoSend] = useState(
    project.ProgettiSerp_AutoSend || false
  );
  const [autoSendMail, setAutoSendMail] = useState(
    project.ProgettiSerp_AutoSendMail || ""
  );
  const { SERVERAPI } = useEnv();
  const token = localStorage.getItem("axo_token");

  // --- Image State and URL ---
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const aziendaPIVA = "06087680960";
  const projectId = project.IDOBJ;
  const imageUrl = projectId
    ? `/personal/${aziendaPIVA}/img/${projectId}.jpeg`
    : null;
  // --- End Image State and URL ---

  useEffect(() => {
    setIsUpdating(project.ProgettiSerp_Stato > 9);
  }, [project.ProgettiSerp_Stato]);

  const domainToDisplay =
    project.ProgettiSerp_DNS || project.domain || "No domain";
  const keywordCount = project.totaleKeyword || project.keywords || 0;
  const lastReportDate = project.dataKeyword || null;

  const handleArchiveProject = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (!project.IDOBJ) {
      setSnackbar({
        open: true,
        message: "ID progetto non valido",
        severity: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const apiUrl = `${SERVERAPI}/api/axo_sel`;
      const UpdPj = { IDOBJ: project.IDOBJ, ProgettiSerp_Stato: 2 };
      const response = await Scrivi(
        apiUrl,
        token,
        project.IDOBJ,
        "progettiserp",
        "progettiserpsel",
        UpdPj
      );
      onProjectUpdate(project.IDOBJ);
    } catch (error) {
      console.error("Error archiving project:", error);
      setSnackbar({
        open: true,
        message: `Errore archiviazione: ${error.message}`,
        severity: "error",
      });
    } finally {
      setOpenMessaggioArchivio(false);
      setLoading(false);
    }
  };

  const handleReloadProject = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (!project.IDOBJ) {
      setSnackbar({
        open: true,
        message: "ID progetto non valido",
        severity: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const apiUrl = `${SERVERAPI}/api/axo_sel`;
      const UpdPj = { IDOBJ: project.IDOBJ, ProgettiSerp_Stato: 10 };
      const response = await Scrivi(
        apiUrl,
        token,
        project.IDOBJ,
        "progettiserp",
        "progettiserpsel",
        UpdPj
      );
      onProjectUpdate(project.IDOBJ);
    } catch (error) {
      console.error("Error archiving project:", error);
    } finally {
      setLoading(false);
      setIsUpdating(true);
    }
  };

  const handleToggleAutoSend = async (e) => {
    e.stopPropagation();
    const newValue = !autoSend;
    setAutoSend(newValue);
    try {
      const apiUrl = `${SERVERAPI}/api/axo_sel`;
      const UpdPj = {
        IDOBJ: project.IDOBJ,
        ProgettiSerp_AutoSend: newValue ? 1 : 0,
      };
      await Scrivi(
        apiUrl,
        token,
        project.IDOBJ,
        "progettiserp",
        "progettiserpsel",
        UpdPj
      );
      setSnackbar({
        open: true,
        message: newValue
          ? "Invio automatico attivato"
          : "Invio automatico disattivato",
        severity: "success",
      });
      if (onProjectUpdate) onProjectUpdate(project.IDOBJ);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Errore salvataggio invio automatico",
        severity: "error",
      });
      setAutoSend(!newValue); // rollback
    }
  };

  const handleAutoSendMailChange = (e) => {
    e.stopPropagation();
    const newEmail = e.target.value;
    setAutoSendMail(newEmail);
  };

  const saveAutoSendMail = async () => {
    try {
      const apiUrl = `${SERVERAPI}/api/axo_sel`;
      const UpdPj = {
        IDOBJ: project.IDOBJ,
        ProgettiSerp_AutoSendMail: autoSendMail,
      };
      await Scrivi(
        apiUrl,
        token,
        project.IDOBJ,
        "progettiserp",
        "progettiserpsel",
        UpdPj
      );
      setSnackbar({
        open: true,
        message: "Email salvata con successo",
        severity: "success",
      });
      if (onProjectUpdate) onProjectUpdate(project.IDOBJ);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Errore salvataggio email",
        severity: "error",
      });
    }
  };

  const handleAutoSendMailKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur(); // Rimuove il focus per attivare onBlur
    }
  };

  const handleAutoSendMailBlur = () => {
    saveAutoSendMail();
  };

  const handleOpenArchiveModal = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setOpenMessaggioArchivio(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCardClick = (event) => {
    if (project.IDOBJ) {
      // Check for modifier keys to open in a new tab
      if (event.ctrlKey || event.metaKey) {
        window.open(`/projects/${project.IDOBJ}`, "_blank");
      } else {
        navigate(`/projects/${project.IDOBJ}`);
      }
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e) => {
    console.error("Error loading image:", imageUrl, e);
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <>
      <Card
        sx={{
          minWidth: 275,
          m: 1,
          borderRadius: 3,
          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          cursor: "pointer",
          position: "relative",
          overflow: "visible",
          pt: 0.5,
          pr: 0.5,
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
          },
        }}
        onClick={handleCardClick}
      >
        {imageUrl && (
          <Box sx={{ height: 140, position: "relative" }}>
            {" "}
            {/* Container for positioning */}
            {imageLoading && (
              <Skeleton
                variant="rectangular"
                height="100%" // Fill container
                animation="wave"
                sx={{ position: "absolute", top: 0, left: 0, width: "100%" }} // Overlay
              />
            )}
            <CardMedia
              component="img"
              height="140"
              image={imageUrl}
              alt={`Screenshot for ${project.ProgettiSerp_Nome || "project"}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sx={{
                objectFit: "cover",
                // Hide the image element itself while loading or if there's an error
                // It will be revealed once loaded and skeleton disappears
                opacity: imageLoading || imageError ? 0 : 1,
                transition: "opacity 0.3s", // Optional fade-in
                height: "100%", // Fill container
                width: "100%",
              }}
            />
            {imageError && !imageLoading && (
              // Show the error placeholder only after loading attempt failed
              <Box
                height="100%" // Fill container
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor="grey.200"
                sx={{ position: "absolute", top: 0, left: 0, width: "100%" }} // Overlay
              >
                <Typography variant="caption" color="text.secondary">
                  Immagine non disponibile
                </Typography>
              </Box>
            )}
          </Box>
        )}
        {/* --- End Image Display --- */}

        <Box sx={{ position: "absolute", top: 6, right: 6, zIndex: 3 }}>
          <Tooltip title="invio automatico" placement="left">
            <Switch
              size="small"
              checked={autoSend}
              onClick={handleToggleAutoSend}
              onChange={handleToggleAutoSend}
              sx={{
                p: 0.2,
                width: 32,
                height: 18,
                "& .MuiSwitch-switchBase": { p: 0.2 },
                "& .MuiSwitch-thumb": { width: 14, height: 14 },
                "& .MuiSwitch-track": {
                  borderRadius: 9,
                  minHeight: 16,
                  height: 16,
                  width: 28,
                  backgroundColor: autoSend ? "#1976d2" : "#bdbdbd",
                  opacity: 1,
                },
              }}
              inputProps={{ "aria-label": "invio automatico" }}
            />
          </Tooltip>
        </Box>
        <CardContent sx={{ p: 3, flexGrow: 1 }}>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight="600"
            color="primary"
          >
            {project.ProgettiSerp_Nome || "Unnamed Project"}
          </Typography>

          {/* Email AutoSend Field */}
          <TextField
            size="small"
            fullWidth
            label="Email AutoSend"
            value={autoSendMail}
            onChange={handleAutoSendMailChange}
            onKeyPress={handleAutoSendMailKeyPress}
            onBlur={handleAutoSendMailBlur}
            onClick={(e) => e.stopPropagation()}
            variant="outlined"
            sx={{ mb: 2 }}
            placeholder="Inserisci email per invio automatico"
          />

          <Box display="flex" alignItems="center" mb={2}>
            <LanguageIcon
              sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
            />
            <Typography color="text.secondary" variant="body2">
              <a
                href={
                  domainToDisplay.startsWith("http")
                    ? domainToDisplay
                    : `https://${domainToDisplay}`
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  wordBreak: "break-all",
                  transition: "text-decoration 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
                onClick={(e) => e.stopPropagation()}
              >
                {domainToDisplay}
              </a>
            </Typography>
          </Box>

          <Stack spacing={1.5} mb={3}>
            <Box display="flex" alignItems="center">
              <AccessTimeIcon
                sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
              />
              <Typography variant="body2">
                Ultimo Report:{" "}
                {lastReportDate
                  ? FormatDate(lastReportDate, "dd/MM/yyyy")
                  : "N/A"}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <TagIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
              <Chip
                label={`${keywordCount} keywords`}
                size="small"
                sx={{
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  color: "primary.main",
                }}
              />
            </Box>
          </Stack>

          <Box display="flex" gap={1} alignItems="center">
            <Button
              variant="contained"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ArchiveOutlinedIcon />
                )
              }
              sx={{
                textTransform: "none",
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
              startIcon={
                isUpdating ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <UpdateIcon />
                )
              }
              sx={{
                textTransform: "none",
                borderRadius: 2,
                flex: 1,
              }}
              onClick={handleReloadProject}
              disabled={loading || isUpdating}
            >
              Aggiorna
            </Button>
            {updateSuccess && (
              <IconButton
                size="small"
                sx={{ color: "success.main", p: 0, ml: 0.5 }}
              >
                <CheckCircleIcon />
              </IconButton>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Modal
        onClose={() => setOpenMessaggioArchivio(false)}
        open={openMessaggioArchivio}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: 4,
            borderRadius: 2,
            boxShadow: 24,
            textAlign: "center",
            minWidth: 300,
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="600">
            Sei sicuro di voler archiviare il progetto?
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" mt={2}>
            <Button
              variant="contained"
              onClick={handleArchiveProject}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Conferma"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenMessaggioArchivio(false)}
              disabled={loading}
            >
              Annulla
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProjectCard;
