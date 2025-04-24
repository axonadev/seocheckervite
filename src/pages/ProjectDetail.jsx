import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import Layout from "../layout/Layout";
import useEnv from "../hooks/useEnv";
import Loader from "../components/Loader";
import ProjectDetailHeader from "../components/ProjectDetailHeader";
import KeywordTable from "../components/KeywordTable";
import KeywordPositionChart from "../components/KeywordPositionChart";
import EditProjectPopup from "../components/EditProjectPopup";
import AddKeywordPopover from "../components/AddKeywordPopover";
import ExportDatePopover from "../components/ExportDatePopover";
import ExportPdfDatePopover from "../components/ExportPdfDatePopover";

import useProjectData from "../hooks/useProjectData";
import { generateCsvReport, generatePdfReport } from "../utility/reportUtils";
import { uploadProjectLogo } from "../utility/apiUtils";
import { Scrivi } from "../utility/callFetch";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { SERVERAPI, AZIENDA } = useEnv();
  const token = localStorage.getItem("axo_token");
  const fileInputRef = useRef(null);

  const { project, keywords, uniqueExtractionDates, projectLogo, loading, error, reloadLogo, setProject, reloadProjectData } = useProjectData(id, token, SERVERAPI, AZIENDA);

  const [searchEngine, setSearchEngine] = useState("");
  const [addKeywordAnchorEl, setAddKeywordAnchorEl] = useState(null);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [exportDateAnchorEl, setExportDateAnchorEl] = useState(null);
  const [exportPdfDateAnchorEl, setExportPdfDateAnchorEl] = useState(null);
  const [editProjectAnchorEl, setEditProjectAnchorEl] = useState(null);

  const [logoImageDataUrl, setLogoImageDataUrl] = useState(null);
  const [posizionamentoImageDataUrl, setPosizionamentoImageDataUrl] = useState(null);

  useEffect(() => {
    if (project?.ProgettiSerp_GoogleRegione) {
      setSearchEngine(project.ProgettiSerp_GoogleRegione);
    } else if (project) {
      setSearchEngine("Italia");
    }
  }, [project]);

  useEffect(() => {
    fetch("/icon/logo.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoImageDataUrl(reader.result);
        reader.readAsDataURL(blob);
      }).catch(err => console.error("Error fetching PDF logo asset:", err));
    fetch("/posizionamento.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setPosizionamentoImageDataUrl(reader.result);
        reader.readAsDataURL(blob);
      }).catch(err => console.error("Error fetching PDF positioning asset:", err));
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSearchEngineChange = async (event) => {
    const newRegion = event.target.value;
    setSearchEngine(newRegion);

    console.log("Selected Google Region:", newRegion);

    if (project?.IDOBJ) {
      try {
        const updatedProjectData = {
          ProgettiSerp_GoogleRegione: newRegion,
        };
        const apiUrl = `${SERVERAPI}/api/axo_sel`;

        const response = await Scrivi(apiUrl, token, project.IDOBJ, "progettiserp", "progettiserpsel", updatedProjectData);

        if (response && (response.Errore || response.stato === 'KO')) {
          throw new Error(response.Errore || 'Errore durante l\'aggiornamento della regione Google');
        }

        console.log("Google Region updated successfully");
      } catch (updateError) {
        console.error("Error updating Google Region:", updateError);
        alert(`Errore durante l'aggiornamento della regione: ${updateError.message}`);
        setSearchEngine(project?.ProgettiSerp_GoogleRegione || "Italia");
      }
    } else {
      console.error("Cannot update Google Region: Project ID not found.");
    }
  };

  const handleLogoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLogoChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.match("image.*")) {
        alert("Per favore seleziona un'immagine");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("L'immagine non può superare i 2MB");
        return;
      }
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop();
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          await uploadProjectLogo(id, token, SERVERAPI, e.target.result, fileExtension);
          reloadLogo();
        } catch (uploadError) {
          console.error("Logo upload failed:", uploadError);
          alert(`Errore durante il caricamento del logo: ${uploadError.message}`);
        }
      };
      reader.readAsDataURL(file);
      event.target.value = null;
    }
  };

  const handleOpenAddKeyword = (event) => setAddKeywordAnchorEl(event.currentTarget);
  const handleCloseAddKeyword = () => { setAddKeywordAnchorEl(null); setNewKeywordInput(""); };
  const handleOpenExportDate = (event) => setExportDateAnchorEl(event.currentTarget);
  const handleCloseExportDate = () => setExportDateAnchorEl(null);
  const handleOpenExportPdfDate = (event) => setExportPdfDateAnchorEl(event.currentTarget);
  const handleCloseExportPdfDate = () => setExportPdfDateAnchorEl(null);
  const handleOpenEditProject = (event) => setEditProjectAnchorEl(event.currentTarget);
  const handleCloseEditProject = () => setEditProjectAnchorEl(null);

  const handleAddKeyword = async () => {
    const keywordToAdd = newKeywordInput.trim();
    if (keywordToAdd && project?.IDOBJ) {
      const url = `${SERVERAPI}/api/axo_sel`;

      const keywordData = {
        progettiserpkeywords_parole: keywordToAdd, // Renamed from KeywordSerp_Keyword
        KeywordSerp_ProgettiSerp_id: project.IDOBJ,
        KeywordSerp_Azienda_id: AZIENDA,
        pidobj: project.IDOBJ,
      };

      const requestBody = {
        Token: token,
        IDOBJ: 0,
        DB: "progettiserpkeywords",
        Modulo: "progettiserpkeywords",
        Classe: "progettiserpkeywordssel",
        Item: ` {progettiserpkeywords:[${JSON.stringify(keywordData)}]} `
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          let errorMsg = `Errore API: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.Errore || errorMsg;
          } catch (parseError) { }
          throw new Error(errorMsg);
        }

        const data = await response.json();

        if (data && (data.Errore || data.stato === 'KO')) {
          throw new Error(data.Errore || 'Errore restituito dall\'API durante l\'aggiunta della keyword');
        }

        console.log("Keyword added successfully");
        handleCloseAddKeyword();

        if (reloadProjectData) {
          reloadProjectData();
        } else {
          console.warn("reloadProjectData function not available from useProjectData. Keyword list may not update automatically.");
        }

      } catch (err) {
        console.error("Error adding keyword:", err);
        alert(`Errore durante l'aggiunta della keyword: ${err.message}`);
      }
    } else {
      if (!keywordToAdd) {
        alert("Inserisci una keyword valida.");
      } else {
        alert("ID Progetto non trovato.");
      }
    }
  };

  const handleDeleteKeyword = async (keywordId) => {
    if (!keywordId) {
      alert("ID Keyword non valido per l'eliminazione.");
      return;
    }
    console.log(`Attempting to delete keyword with ID: ${keywordId}`);

    // Check if the ID is a temporary one
    if (String(keywordId).startsWith('temp-')) {
      alert("Questa keyword non è ancora salvata nel database. Verrà rimossa alla prossima ricarica della pagina.");
      return;
    }

    // Find the keyword object to get the correct ID format
    const keywordToDelete = keywords.find(kw => kw.id === keywordId);
    console.log("Keyword to delete:", keywordToDelete);
    
    if (!keywordToDelete) {
      alert("Keyword non trovata nella lista.");
      return;
    }
    
    // Use idobj if available
    const actualId = keywordToDelete.idobj || keywordId;
    console.log("Using ID for deletion:", actualId);

    const confirmation = window.confirm("Sei sicuro di voler eliminare questa keyword?");
    if (!confirmation) {
      return;
    }

    const url = `${SERVERAPI}/api/axo_sel`;
    const requestBody = {
      Token: token,
      IDOBJ: actualId * -1,
      DB: "progettiserpkeywords",
      Modulo: "Elimina Key",
      Classe: "progettiserpkeywordssel",
      Item: `[{progettiserpkeywords:[{"PIDOBJ":${project.IDOBJ},"IDOBJ":${actualId * -1}}]}]`
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMsg = `Errore API (${response.status}): ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Check response structure for success/failure indication from the API logic
      if (data && (data.Errore || data.stato === 'KO')) {
        // Handle specific error messages if available
        if (data.Errore && data.Errore.includes("DELETE statement conflicted")) {
           throw new Error("Eliminazione fallita: la keyword potrebbe essere collegata ad altri dati.");
        }
        throw new Error(data.Errore || 'Errore restituito dall\'API durante l\'eliminazione');
      }

      console.log(`Keyword with ID ${actualId} deleted successfully`);
      // alert("Keyword eliminata con successo."); // Optional: Consider removing if reload is sufficient feedback

      // Refresh data
      if (reloadProjectData) {
        reloadProjectData();
      } else {
        console.warn("reloadProjectData function not available. Keyword list may not update automatically.");
      }

    } catch (err) {
      console.error(`Error deleting keyword ${actualId}:`, err);
      alert(`Errore durante l'eliminazione della keyword: ${err.message}`);
    }
  };

  const triggerCsvExport = (dateString) => {
    generateCsvReport(project, keywords, dateString);
    handleCloseExportDate();
  };

  const triggerPdfExport = (dateString) => {
    generatePdfReport(project, keywords, dateString, logoImageDataUrl, posizionamentoImageDataUrl);
    handleCloseExportPdfDate();
  };

  const handleProjectUpdated = (updatedProjectData) => {
    setProject(updatedProjectData);
    handleCloseEditProject();
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <Layout showSearchBar={false} label="project-detail"> 
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error">Error loading project: {error}</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick} sx={{ mt: 2 }}> Indietro </Button>
        </Box>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout showSearchBar={false} label="project-detail">
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>Project not found.</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick} sx={{ mt: 2 }}> Indietro </Button>
        </Box>
      </Layout>
    );
  }

  const openAddKeyword = Boolean(addKeywordAnchorEl);
  const addKeywordPopoverId = openAddKeyword ? "add-keyword-popover" : undefined;
  const openExportDate = Boolean(exportDateAnchorEl);
  const exportDatePopoverId = openExportDate ? "export-date-popover" : undefined;
  const openExportPdfDate = Boolean(exportPdfDateAnchorEl);
  const exportPdfDatePopoverId = openExportPdfDate ? "export-pdf-date-popover" : undefined;
  const openEditProject = Boolean(editProjectAnchorEl);
  const editProjectPopoverId = openEditProject ? "edit-project-popover" : undefined;

  return (
    <Layout showSearchBar={false} label="project-detail">
      <Box sx={{ p: 3 }}>
        <ProjectDetailHeader
          project={project}
          projectLogo={projectLogo}
          onLogoChange={handleLogoChange}
          onOpenEditProject={handleOpenEditProject}
          editProjectAnchorEl={editProjectAnchorEl}
          onCloseEditProject={handleCloseEditProject}
          onProjectUpdated={handleProjectUpdated}
          editProjectPopoverId={editProjectPopoverId}
        />

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <KeywordTable
              keywords={keywords}
              searchEngine={searchEngine}
              onSearchEngineChange={handleSearchEngineChange}
              onOpenAddKeyword={handleOpenAddKeyword}
              onOpenExportDate={handleOpenExportDate}
              onOpenExportPdfDate={handleOpenExportPdfDate}
              addKeywordPopoverId={addKeywordPopoverId}
              exportDatePopoverId={exportDatePopoverId}
              exportPdfDatePopoverId={exportPdfDatePopoverId}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <KeywordPositionChart keywords={keywords} projectId={project?.IDOBJ} token={token} />
          </Grid>
        </Grid>

        <EditProjectPopup
          project={project}
          anchorEl={editProjectAnchorEl}
          onClose={handleCloseEditProject}
          onProjectUpdated={handleProjectUpdated}
        />

        <AddKeywordPopover
          id={addKeywordPopoverId}
          open={openAddKeyword}
          anchorEl={addKeywordAnchorEl}
          onClose={handleCloseAddKeyword}
          keywords={keywords}
          onAddKeyword={handleAddKeyword}
          onDeleteKeyword={handleDeleteKeyword}
          newKeywordInput={newKeywordInput}
          onNewKeywordInputChange={(e) => setNewKeywordInput(e.target.value)}
        />

        <ExportDatePopover
          id={exportDatePopoverId}
          open={openExportDate}
          anchorEl={exportDateAnchorEl}
          onClose={handleCloseExportDate}
          uniqueExtractionDates={uniqueExtractionDates}
          onExportCsvWithDate={triggerCsvExport}
        />

        <ExportPdfDatePopover
          id={exportPdfDatePopoverId}
          open={openExportPdfDate}
          anchorEl={exportPdfDateAnchorEl}
          onClose={handleCloseExportPdfDate}
          uniqueExtractionDates={uniqueExtractionDates}
          onExportPdfWithDate={triggerPdfExport}
        />
      </Box>
    </Layout>
  );
};

export default ProjectDetail;
