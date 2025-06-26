import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import KeyIcon from "@mui/icons-material/Key";
import { Difference, PictureAsPdf } from "@mui/icons-material";
import useEnv from "../hooks/useEnv";
import { Scrivi } from "../utility/callFetch";

const KeywordTable = ({
  keywords,
  searchEngine,
  onSearchEngineChange,
  onOpenAddKeyword,
  onOpenExportDate,
  onOpenExportPdfDate,
  addKeywordPopoverId,
  exportDatePopoverId,
  exportPdfDatePopoverId,
  project,
  onProjectUpdate,
}) => {
  const { SERVERAPI } = useEnv();
  const token = localStorage.getItem("axo_token");

  // Email AutoSend state and functionality
  const [autoSendMail, setAutoSendMail] = useState(
    project?.ProgettiSerp_AutoSendMail || ""
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Update email when project changes
  React.useEffect(() => {
    setAutoSendMail(project?.ProgettiSerp_AutoSendMail || "");
  }, [project?.ProgettiSerp_AutoSendMail]);

  const handleAutoSendMailChange = (e) => {
    const newEmail = e.target.value;
    setAutoSendMail(newEmail);
  };

  const saveAutoSendMail = async () => {
    if (!project?.IDOBJ) return;

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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const keywordColumns = [
    {
      field: "KeywordSerp_Keyword",
      headerName: "Keywords",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const keyword = params.value;
        const [hovered, setHovered] = React.useState(false);
        const [ctrlPressed, setCtrlPressed] = React.useState(false);
        React.useEffect(() => {
          const handleKeyDown = (e) => {
            if (e.key === "Control") setCtrlPressed(true);
          };
          const handleKeyUp = (e) => {
            if (e.key === "Control") setCtrlPressed(false);
          };
          window.addEventListener("keydown", handleKeyDown);
          window.addEventListener("keyup", handleKeyUp);
          return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
          };
        }, []);
        const isClickable = hovered && ctrlPressed;

        const googleGeo =
          searchEngine == "Internazionale"
            ? "com"
            : searchEngine == "Germania"
              ? "de"
              : searchEngine == "Spagna"
                ? "es"
                : searchEngine == "Regno Unito"
                  ? "co.uk"
                  : searchEngine == "Francia"
                    ? "fr"
                    : searchEngine == "Portogallo"
                      ? "pt"
                      : "it";

        return (
          <span
            style={{
              color: isClickable ? "#1976d2" : "#333",
              textDecoration: isClickable ? "underline" : "none",
              cursor: isClickable ? "pointer" : "default",
              transition: "color 0.2s",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={
              isClickable
                ? "Apri Google Search (Ctrl+Click)"
                : "Tieni premuto Ctrl e passa sopra per aprire"
            }
          >
            <a
              style={{ color: "inherit", textDecoration: "none" }}
              href={
                "https://www.google." +
                googleGeo +
                "/search?q=" +
                keyword.replaceAll(" ", "+")
              }
            >
              {keyword}
            </a>
          </span>
        );
      },
    },
    {
      field: "KeywordSerp_Posizione",
      headerName: "Posizione",
      width: 100,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "KeywordSerp_Variazione",
      headerName: "Variazione",
      width: 100,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => {
        const val =
          typeof value === "object" && value !== null ? value.value : value;
        if (val === -999 || val === "-999" || val == null) {
          return "-";
        }
        return val;
      },
    },
    {
      field: "KeywordSerp_URL",
      headerName: "URL",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => {
        const url = params.value;
        const [hovered, setHovered] = React.useState(false);
        const [ctrlPressed, setCtrlPressed] = React.useState(false);
        React.useEffect(() => {
          const handleKeyDown = (e) => {
            if (e.key === "Control") setCtrlPressed(true);
          };
          const handleKeyUp = (e) => {
            if (e.key === "Control") setCtrlPressed(false);
          };
          window.addEventListener("keydown", handleKeyDown);
          window.addEventListener("keyup", handleKeyUp);
          return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
          };
        }, []);
        if (!url) return "-";
        const isClickable = hovered && ctrlPressed;
        return (
          <span
            style={{
              color: isClickable ? "#1976d2" : "#333",
              textDecoration: isClickable ? "underline" : "none",
              cursor: isClickable ? "pointer" : "default",
              transition: "color 0.2s",
              wordBreak: "break-all",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={(e) => {
              if (isClickable) {
                window.open(
                  url.startsWith("http") ? url : `https://${url}`,
                  "_blank",
                  "noopener"
                );
                e.stopPropagation();
              }
            }}
            title={
              isClickable
                ? "Apri URL (Ctrl+Click)"
                : "Tieni premuto Ctrl e passa sopra per aprire"
            }
          >
            {url}
          </span>
        );
      },
    },
  ];

  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <KeyIcon />
          <Typography variant="h6">Totale Keywords</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Email AutoSend Field */}
          <TextField
            size="small"
            label="Email AutoSend"
            value={autoSendMail}
            onChange={handleAutoSendMailChange}
            onKeyPress={handleAutoSendMailKeyPress}
            onBlur={handleAutoSendMailBlur}
            variant="outlined"
            sx={{ minWidth: 200 }}
            placeholder="Email per invio automatico"
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              labelId="search-engine-label"
              value={searchEngine}
              onChange={onSearchEngineChange}
            >
              <MenuItem value="Italia">google.it - Italia</MenuItem>
              <MenuItem value="Internazionale">
                google.com - Internazionale
              </MenuItem>
              <MenuItem value="Germania">google.de - Germania</MenuItem>
              <MenuItem value="Spagna">google.es - Spagna</MenuItem>
              <MenuItem value="Regno Unito">
                google.co.uk - Regno Unito
              </MenuItem>
              <MenuItem value="Francia">google.fr - Francia</MenuItem>
              <MenuItem value="Portogallo">google.pt - Portogallo</MenuItem>
            </Select>
          </FormControl>

          <IconButton
            size="small"
            onClick={onOpenExportDate}
            aria-describedby={exportDatePopoverId}
          >
            <Difference />
          </IconButton>
          <IconButton
            size="small"
            onClick={onOpenExportPdfDate}
            aria-describedby={exportPdfDatePopoverId}
          >
            <PictureAsPdf />
          </IconButton>
          <IconButton
            size="small"
            onClick={onOpenAddKeyword}
            aria-describedby={addKeywordPopoverId}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={keywords}
          columns={keywordColumns}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          density="standard"
          rowHeight={43}
          getRowId={(row) => row.id}
        />
      </Box>

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
    </Paper>
  );
};

export default KeywordTable;
