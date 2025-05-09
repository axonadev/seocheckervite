import React, { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useEnv from "../hooks/useEnv";
import { useNavigate } from "react-router-dom";

const NewProjectPopup = ({ anchorEl, onClose, onProjectAdded }) => {
  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("https://");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();
  const { SERVERAPI } = useEnv();
  const token = localStorage.getItem("axo_token");
  const open = Boolean(anchorEl);

  // Fallback function to get the last created project
  const fallbackGetLastProjectId = async () => {
    const getUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggi`;

    try {
      const res = await fetch(getUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const getData = await res.json();
      if (getData?.Itemset?.v_progettiserp?.length > 0) {
        const sorted = getData.Itemset.v_progettiserp.sort((a, b) => {
          return new Date(b.dataInserimento) - new Date(a.dataInserimento);
        });

        return sorted[0]?.IDOBJ || null;
      }
    } catch (err) {
      console.error("Errore nella fallback GET:", err);
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      setSnackbar({
        open: true,
        message: "Inserisci il nome del progetto",
        severity: "error",
      });
      return;
    }

    if (!projectUrl.trim() || projectUrl === "https://") {
      setSnackbar({
        open: true,
        message: "Inserisci un URL valido",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    const projectUrlPattern =projectUrl.endsWith("/")
    ? projectUrl.slice(0, -1)
    : projectUrl


    const newProject = {
      ProgettiSerp_Nome: projectName,
      // sostituire / finale con niente

      ProgettiSerp_DNS: projectUrlPattern
        .replaceAll("www.", "")
        .replaceAll("https://", "")
        .replaceAll("http://", ""),
      ProgettiSerp_Stato: 0,
      ProgettiSerp_GoogleRegione: "Italia",
      dataInserimento: new Date().toISOString(),
    };

    const apiUrl = `${SERVERAPI}/api/axo_sel`;

    const requestBody = {
      Token: token,
      IDOBJ: 0,
      DB: "progettiserp",
      Modulo: "progettiserp",
      Classe: "progettiserpsel",
      Item: JSON.stringify({ progettiserp: [newProject] }),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let projectId = null;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      console.log("POST response:", data);

      if (data?.IDOBJ) {
        projectId = parseInt(data.IDOBJ, 10);
      } else if (Array.isArray(data?.Item) && data.Item[0]?.IDOBJ) {
        projectId = parseInt(data.Item[0].IDOBJ, 10);
      }

      // Fallback se l'ID non è arrivato dalla POST
      if (!projectId) {
        console.warn(
          "ID non presente nella risposta POST, uso fallback GET..."
        );
        projectId = await fallbackGetLastProjectId();
      }

      setSnackbar({
        open: true,
        message: "Progetto creato con successo!",
        severity: "success",
      });

      setProjectName("");
      setProjectUrl("https://");
      onClose();
      if (onProjectAdded) onProjectAdded();

      if (projectId) {
        console.log(`Navigating to project ID: ${projectId}`);
        setTimeout(() => navigate(`/projects/${projectId}`), 300);
      } else {
        console.error("Nessun ID progetto trovato, reindirizzo alla home");
        navigate("/");
      }
    } catch (error) {
      console.error("Errore creazione progetto:", error);
      setSnackbar({
        open: true,
        message: `Errore: ${error.message || "Errore durante la creazione del progetto"}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        transformOrigin={{ vertical: "center", horizontal: "left" }}
      >
        <Paper sx={{ p: 2, width: "300px", bgcolor: "#f5f5f5" }}>
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <AddIcon sx={{ color: "#673ab7" }} />
            <Typography variant="h6">Nuovo Progetto</Typography>
          </Box>

          <TextField
            fullWidth
            label="Nome Progetto"
            variant="outlined"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={loading}
            sx={{ mb: 2, bgcolor: "#fff" }}
          />

          <TextField
            fullWidth
            label="URL del Progetto"
            variant="outlined"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            disabled={loading}
            sx={{ mb: 2, bgcolor: "#fff" }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
            sx={{ bgcolor: "#673ab7" }}
          >
            {loading ? "Creazione in corso..." : "Aggiungi Progetto"}
          </Button>
        </Paper>
      </Popover>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
    </>
  );
};

export default NewProjectPopup;
