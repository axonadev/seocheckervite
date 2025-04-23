import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Avatar,
  Popover,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import KeyIcon from "@mui/icons-material/Key";
import PeopleIcon from "@mui/icons-material/People";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import Layout from "../layout/Layout";
import useEnv from "../hooks/useEnv";
import { FormatDate } from "../utility/FormatDate";
import Loader from "../components/Loader";
import EditProjectPopup from "../components/EditProjectPopup";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { SERVERAPI, SERVERWEB, AZIENDA } = useEnv();
  const token = localStorage.getItem("axo_token");
  const fileInputRef = useRef(null);

  const [project, setProject] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [keywordsGraphics, setKeywordsGraphics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchEngine, setSearchEngine] = useState("google.it - Italia");
  const [projectLogo, setProjectLogo] = useState(null);
  const [addKeywordAnchorEl, setAddKeywordAnchorEl] = useState(null);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [exportDateAnchorEl, setExportDateAnchorEl] = useState(null);
  const [uniqueExtractionDates, setUniqueExtractionDates] = useState([]);
  const [exportPdfDateAnchorEl, setExportPdfDateAnchorEl] = useState(null);
  const [logoImageDataUrl, setLogoImageDataUrl] = useState(null);
  const [posizionamentoImageDataUrl, setPosizionamentoImageDataUrl] =
    useState(null);
  const [editProjectAnchorEl, setEditProjectAnchorEl] = useState(null);

  useEffect(() => {
    fetch("/icon/logo.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoImageDataUrl(reader.result);
        };
        reader.readAsDataURL(blob);
      });

    fetch("/posizionamento.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPosizionamentoImageDataUrl(reader.result);
        };
        reader.readAsDataURL(blob);
      });

    fetch("/personal/" + AZIENDA + "/doc/logo/logo_" + id + ".png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProjectLogo(reader.result);
        };
        reader.readAsDataURL(blob);
      });
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      setError(null);
      try {
        const projectUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggi/${id}`;
        const projectResponse = await fetch(projectUrl);
        if (!projectResponse.ok) {
          throw new Error(`HTTP error! status: ${projectResponse.status}`);
        }
        const projectData = await projectResponse.json();

        if (
          projectData?.Itemset?.v_progettiserp &&
          projectData.Itemset.v_progettiserp.length > 0
        ) {
          setProject(projectData.Itemset.v_progettiserp[0]);
        } else {
          throw new Error("Project not found");
        }

        const keywordsUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggiKeyWords/${id}`;
        const keywordsResponse = await fetch(keywordsUrl);
        if (!keywordsResponse.ok) {
          console.error(
            `HTTP error fetching keywords! status: ${keywordsResponse.status}`
          );
          setKeywords([]);
          setKeywordsGraphics([]);
          setUniqueExtractionDates([]);
        } else {
          const keywordsData = await keywordsResponse.json();
          console.log("keywordsData", keywordsData);

          const keywordsWithId = (keywordsData?.Itemset?.v_keywords || []).map(
            (kw, index) => ({
              id: kw.IDOBJ || index,
              KeywordSerp_Keyword:
                kw.KeywordSerp_Keyword || kw.keyword || kw.Keyword || "",
              KeywordSerp_Posizione:
                kw.KeywordSerp_Posizione || kw.posizione || kw.Posizione || "",
              KeywordSerp_Variazione:
                kw.KeywordSerp_Variazione ||
                kw.variazione ||
                kw.Variazione ||
                "",
              KeywordSerp_URL:
                kw.urlkey || kw.KeywordSerp_URL || kw.url || kw.URL || "",
            })
          );
          setKeywords(keywordsWithId);

          const dates = keywordsData?.Itemset?.v_keywords
            ?.map((item) => item.dataestrazione)
            .filter((date, index, self) => date && self.indexOf(date) === index)
            .sort((a, b) => new Date(b) - new Date(a));
          setUniqueExtractionDates(dates || []);
          console.log("Unique Extraction Dates from v_keywords:", dates);
          setKeywordsGraphics(keywordsData?.Itemset?.v_graphicdata || []);
        }
      } catch (err) {
        console.error("Error loading project details:", err);
        setError(err.message);
        setProject(null);
        setKeywords([]);
        setKeywordsGraphics([]);
        setUniqueExtractionDates([]);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchProjectData();
    } else {
      setError("Project ID or token is missing.");
      setLoading(false);
    }
  }, [id, token, SERVERAPI]);

  const refetchProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      const projectUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggi/${id}`;
      const projectResponse = await fetch(projectUrl);
      if (!projectResponse.ok) {
        throw new Error(`HTTP error! status: ${projectResponse.status}`);
      }
      const projectData = await projectResponse.json();

      if (
        projectData?.Itemset?.v_progettiserp &&
        projectData.Itemset.v_progettiserp.length > 0
      ) {
        setProject(projectData.Itemset.v_progettiserp[0]);
      } else {
        throw new Error("Project not found after update");
      }
    } catch (err) {
      console.error("Error refetching project details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSearchEngineChange = (event) => {
    setSearchEngine(event.target.value);
  };

  const handleLogoClick = () => {
    fileInputRef.current.click();
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
      reader.onload = (e) => {
        const base64String = e.target.result;
        uploadLogo(base64String, fileExtension);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (base64, estensione) => {
    const UpdPj = {
      b64: base64,
      estensione: "." + estensione,
      nomefile: "logo_" + id,
      cartellasalvataggio: "logo",
      pathiisdaregistro: "true",
    };

    const formData = {
      Token: token,
      Idobj: id,
      Modulo: "Upload B64",
      Classe: "axo_funzioni",
      DB: "",
      Funzione: "salvaDocumento",
      Parametri: "[" + JSON.stringify(UpdPj) + "]",
    };
    try {
      const response = await fetch(SERVERAPI + "/api/axo_sel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        //const data = await response.json();
        setProg((pp) => {
          return pp + 1;
        });
        setLogo(
          SERVERWEB +
            "/personal/" +
            REACT_AZIENDA +
            "/doc/logo/logo_" +
            id +
            ".png?v=" +
            Math.random()
        );
      } else {
        const errorData = await response.json();
        console.error(errorData.message);
      }
    } catch (error) {
      console.error("Dati errati o utente non registrato", error);
    }
  };

  const handleOpenAddKeyword = (event) => {
    setAddKeywordAnchorEl(event.currentTarget);
  };

  const handleCloseAddKeyword = () => {
    setAddKeywordAnchorEl(null);
    setNewKeywordInput("");
  };

  const handleAddKeyword = () => {
    if (newKeywordInput.trim()) {
      const newKeyword = {
        id: `temp-${Date.now()}`,
        KeywordSerp_Keyword: newKeywordInput.trim(),
        KeywordSerp_Posizione: null,
        KeywordSerp_Variazione: null,
        KeywordSerp_URL: "",
      };
      setKeywords((prevKeywords) => [...prevKeywords, newKeyword]);
      handleCloseAddKeyword();
      console.log("New keyword added (frontend only):", newKeyword);
    }
  };

  const handleDeleteKeyword = (keywordId) => {
    setKeywords((prevKeywords) =>
      prevKeywords.filter((kw) => kw.id !== keywordId)
    );
    console.log("Keyword deleted (frontend only):", keywordId);
  };

  const handleOpenExportDate = (event) => {
    setExportDateAnchorEl(event.currentTarget);
  };

  const handleCloseExportDate = () => {
    setExportDateAnchorEl(null);
  };

  const handleExportCsvWithDate = (dateString) => {
    if (!keywords || keywords.length === 0) {
      console.log("No keywords to export.");
      return;
    }

    const headers = ["Keyword", "Posizione", "Variazione", "URL"];
    const csvRows = [
      headers.join(";"),
      ...keywords.map((row) =>
        [
          `"${(row.KeywordSerp_Keyword || "").replace(/"/g, '""')}"`,
          row.KeywordSerp_Posizione ?? "",
          row.KeywordSerp_Variazione === -999 ||
          row.KeywordSerp_Variazione === "-999" ||
          row.KeywordSerp_Variazione == null
            ? "-"
            : row.KeywordSerp_Variazione ?? "",
          `"${(row.KeywordSerp_URL || "").replace(/"/g, '""')}"`,
        ].join(";")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    const selectedDate = dateString
      ? FormatDate(new Date(dateString), "yyyyMMdd")
      : FormatDate(new Date(), "yyyyMMdd");
    const filename = `keywords_${
      project?.ProgettiSerp_Nome || "export"
    }_${selectedDate}.csv`;
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleCloseExportDate();
  };

  const handleOpenExportPdfDate = (event) => {
    setExportPdfDateAnchorEl(event.currentTarget);
  };

  const handleCloseExportPdfDate = () => {
    setExportPdfDateAnchorEl(null);
  };

  const handleExportPdfWithDate = (dateString) => {
    if (!keywords || keywords.length === 0) {
      console.log("No keywords to export for PDF.");
      return;
    }

    const filteredKeywords = keywords.filter((kw) => {
      const position = kw.KeywordSerp_Posizione;
      return typeof position === "number" && position >= 1 && position <= 10;
    });

    if (filteredKeywords.length === 0) {
      console.log("No keywords found in positions 1-10 to export for PDF.");
      alert("Nessuna keyword trovata nelle posizioni 1-10 per questa data.");
      handleCloseExportPdfDate();
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const selectedDate = dateString
      ? FormatDate(new Date(dateString), "dd-MM-yyyy")
      : FormatDate(new Date(), "dd-MM-yyyy");
    const filenameBase = `keywords_${
      project?.ProgettiSerp_Nome || "export"
    }_${selectedDate}_pos1-10`;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    const drawHeader = (data) => {
      try {
        const logoHeight = 15;
        const logoWidth = 50;
        const logoX = pageWidth / 2 - logoWidth / 2;
        const logoY = margin - 5;

        if (logoImageDataUrl) {
          doc.addImage(
            logoImageDataUrl,
            "PNG",
            logoX,
            logoY,
            logoWidth,
            logoHeight
          );
        } else {
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          doc.text("AM Partners", pageWidth / 2, logoY + 7, {
            align: "center",
          });
        }
      } catch (error) {
        console.error("Error creating PDF header:", error);
      }
    };

    const drawFooter = (data) => {
      const footerY = pageHeight - margin - 5;
      const colWidth = (pageWidth - 2 * margin) / 4;
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.setLineWidth(0.2);
      doc.setDrawColor(120, 180, 70);
      doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

      doc.setFont(undefined, "bold");
      doc.text("HUB", margin, footerY + 2);
      doc.setFont(undefined, "normal");
      doc.text("VIA COSIMO DEL FRATE, 16", margin, footerY + 5);
      doc.text("LEGNANO (MI)", margin, footerY + 8);

      const col2X = margin + colWidth;
      doc.setFont(undefined, "bold");
      doc.text("CUBE [CORE] ROOM", col2X, footerY + 2);
      doc.setFont(undefined, "normal");
      doc.text("VIA MONTE NAPOLEONE, 22", col2X, footerY + 5);
      doc.text("MILANO", col2X, footerY + 8);

      const col3X = margin + colWidth * 2;
      doc.setFont(undefined, "bold");
      doc.text("SEDE LEGALE", col3X, footerY + 2);
      doc.setFont(undefined, "normal");
      doc.text("VIA I BOSSI, 46", col3X, footerY + 5);
      doc.text("RESCALDINA (MI)", col3X, footerY + 8);

      const col4X = margin + colWidth * 3;
      doc.setFont(undefined, "bold");
      doc.text("www.ampartners.info", col4X, footerY + 2);
      doc.setFont(undefined, "normal");
      doc.text("info@ampartners.info", col4X, footerY + 5);
    };

    drawHeader();
    doc.setFontSize(22);
    doc.setFont(undefined, "bold");
    doc.text("REPORT", pageWidth / 2, margin + 25, { align: "center" });
    doc.setFontSize(26);
    doc.text("POSIZIONAMENTO KEYWORD", pageWidth / 2, margin + 38, {
      align: "center",
    });

    if (posizionamentoImageDataUrl) {
      const imgWidth = 140;
      const imgHeight = 70;
      const imgX = pageWidth / 2 - imgWidth / 2;
      const imgY = margin + 50;
      doc.addImage(
        posizionamentoImageDataUrl,
        "PNG",
        imgX,
        imgY,
        imgWidth,
        imgHeight
      );
    }

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    const reportText = `REPORT PAROLE CHIAVE ${selectedDate}`;
    const reportTextWidth = doc.getTextWidth(reportText);
    doc.text(
      reportText,
      pageWidth - margin - reportTextWidth,
      pageHeight - margin - 20
    );

    drawFooter();

    doc.addPage();

    const tableColumn = [
      "PAROLA CHIAVE",
      "POSIZIONE SU GOOGLE",
      "PAGINA SITO POSIZIONATA",
    ];
    const tableRows = [];
    filteredKeywords.forEach((kw) => {
      const keywordData = [
        kw.KeywordSerp_Keyword || "",
        kw.KeywordSerp_Posizione ?? "",
        kw.KeywordSerp_URL || "",
      ];
      tableRows.push(keywordData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: margin + 20,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 1.5,
        valign: "middle",
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: "auto", halign: "left" },
      },
      didDrawPage: (data) => {
        drawHeader(data);
        drawFooter(data);
      },
      margin: {
        top: margin + 10,
        bottom: margin + 15,
        left: margin,
        right: margin,
      },
    });

    doc.addPage();

    drawHeader();
    drawFooter();

    let yPosition = margin + 25;
    const leftMargin = margin + 5;
    const lineHeight = 6;

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text("Breve legenda delle voci del report:", leftMargin, yPosition);

    yPosition += lineHeight;
    doc.setFont(undefined, "bold");
    doc.text("PAROLA CHIAVE:", leftMargin, yPosition);
    doc.setFont(undefined, "normal");
    doc.text(
      'con il termine "parole chiave" (keywords), si identificano le ricerche che gli utenti effettuano sui motori di ricerca per trovare una risposta a un',
      leftMargin + 35,
      yPosition
    );
    yPosition += lineHeight - 1;
    doc.text(
      "bisogno specifico. ... Le query sono un insieme di parole, domande o frasi, digitate nel motore di ricerca, che racchiudono un'intenzione di ricerca.",
      leftMargin,
      yPosition
    );

    yPosition += lineHeight * 2;
    doc.setFont(undefined, "bold");
    doc.text("POSIZIONE SU GOOGLE.IT:", leftMargin, yPosition);
    doc.setFont(undefined, "normal");
    doc.text(
      "nel report vengono proposte le parole chiave che hanno raggiunto le prime 10 posizioni nelle pagine del motore di ricerca",
      leftMargin + 45,
      yPosition
    );
    yPosition += lineHeight - 1;
    doc.text(
      "(Google.it), ovvero che occupano la Prima Pagina di Google.",
      leftMargin,
      yPosition
    );

    yPosition += lineHeight * 2;
    doc.setFont(undefined, "bold");
    doc.text("PAGINA SITO POSIZIONATA:", leftMargin, yPosition);
    doc.setFont(undefined, "normal");
    doc.text(
      'è la pagina del sito che Google ha intercettato e "premiato". Diverse pagine posizionate indicano che il motore di ricerca ha',
      leftMargin + 52,
      yPosition
    );
    yPosition += lineHeight - 1;
    doc.text(
      '"recepito" correttamente i vari contenuti del sito.',
      leftMargin,
      yPosition
    );

    yPosition += lineHeight * 3;
    doc.setFont(undefined, "bold");
    doc.text("IL VOSTRO TEAM DEL PROGETTO", leftMargin, yPosition);

    yPosition += lineHeight * 1.5;
    const teamData = [
      ["Chiara: SEO E CONTENT", "chiara@ampartners.info"],
      ["Camilla: GRAFICA E WEBDESIGN", "camilla@ampartners.info"],
      ["Marco: PROJECT MANAGER", "marco@ampartners.info"],
      ["Antonio: DIREZIONE", "antonio@ampartners.info"],
    ];

    const emailColumnX = leftMargin + 80;
    teamData.forEach((member, index) => {
      const currentY = yPosition + index * lineHeight * 1.2;
      doc.setFont(undefined, "bold");
      doc.text(member[0], leftMargin, currentY);
      doc.setFont(undefined, "normal");
      doc.text(member[1], emailColumnX, currentY);
    });

    yPosition += lineHeight * 7;
    doc.setFont(undefined, "bold");
    doc.text("PROMEMORIA", leftMargin, yPosition);
    yPosition += lineHeight * 1.2;
    doc.setFont(undefined, "normal");
    doc.text(
      "Vi ricordiamo di segnalarci eventuali prodotti/servizi/ o parole chiave importanti da inserire all'interno del piano editoriale di content marketing.",
      leftMargin,
      yPosition
    );

    doc.save(`${filenameBase}.pdf`);
    handleCloseExportPdfDate();
  };

  const handleOpenEditProject = (event) => {
    setEditProjectAnchorEl(event.currentTarget);
  };

  const handleCloseEditProject = () => {
    setEditProjectAnchorEl(null);
  };

  const handleProjectUpdated = (updatedProjectData) => {
    setProject(updatedProjectData);
    handleCloseEditProject();
  };

  const openAddKeyword = Boolean(addKeywordAnchorEl);
  const addKeywordPopoverId = openAddKeyword
    ? "add-keyword-popover"
    : undefined;
  const openExportDate = Boolean(exportDateAnchorEl);
  const exportDatePopoverId = openExportDate
    ? "export-date-popover"
    : undefined;
  const openExportPdfDate = Boolean(exportPdfDateAnchorEl);
  const exportPdfDatePopoverId = openExportPdfDate
    ? "export-pdf-date-popover"
    : undefined;
  const openEditProject = Boolean(editProjectAnchorEl);
  const editProjectPopoverId = openEditProject
    ? "edit-project-popover"
    : undefined;

  const keywordColumns = [
    {
      field: "KeywordSerp_Keyword",
      headerName: "Keywords",
      flex: 1,
      minWidth: 200,
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
        if (value === -999 || value === "-999" || value == null) {
          return "-";
        }
        return value;
      },
    },
    { field: "KeywordSerp_URL", headerName: "URL", flex: 1, minWidth: 250 },
  ];

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Layout showSearchBar={false}>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error">Error loading project: {error}</Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
            sx={{ mt: 2 }}
          >
            Indietro
          </Button>
        </Box>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout showSearchBar={false}>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>Project not found.</Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
            sx={{ mt: 2 }}
          >
            Indietro
          </Button>
        </Box>
      </Layout>
    );
  }

  const positionData = {
    pos1_10: keywords.filter(
      (k) => k.KeywordSerp_Posizione >= 1 && k.KeywordSerp_Posizione <= 10
    ).length,
    pos11_20: keywords.filter(
      (k) => k.KeywordSerp_Posizione >= 11 && k.KeywordSerp_Posizione <= 20
    ).length,
    pos21_50: keywords.filter(
      (k) => k.KeywordSerp_Posizione >= 21 && k.KeywordSerp_Posizione <= 50
    ).length,
    pos_gt_50: keywords.filter((k) => k.KeywordSerp_Posizione > 50).length,
    pos_undefined: keywords.filter(
      (k) =>
        k.KeywordSerp_Posizione == null ||
        k.KeywordSerp_Posizione === "" ||
        k.KeywordSerp_Posizione <= 0
    ).length,
  };
  const totalKeywordsInChart = keywords.length;

  const pieChartData = {
    labels: [
      `Pos. 1-10 (${positionData.pos1_10})`,
      `Pos. 11-20 (${positionData.pos11_20})`,
      `Pos. 21-50 (${positionData.pos21_50})`,
      `Pos. > 50 (${positionData.pos_gt_50})`,
      `Non definite (${positionData.pos_undefined})`,
    ],
    datasets: [
      {
        label: "% Presenza URL",
        data: [
          positionData.pos1_10,
          positionData.pos11_20,
          positionData.pos21_50,
          positionData.pos_gt_50,
          positionData.pos_undefined,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              const total = context.chart.data.datasets[0].data.reduce(
                (a, b) => a + b,
                0
              );
              const value = context.parsed;
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "0%";
              label += `${value} (${percentage})`;
            }
            return label;
          },
        },
      },
    },
    cutout: "60%",
  };

  return (
    <Layout showSearchBar={false}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} sx={{ mb: 3, alignItems: "flex-start" }}>
          <Grid item xs={12} md={4}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
              onClick={handleOpenEditProject}
              aria-describedby={editProjectPopoverId}
            >
              {project.ProgettiSerp_Nome || "Unnamed Project"}
              <EditIcon
                fontSize="inherit"
                sx={{ ml: 0.5, color: "text.secondary" }}
              />
            </Typography>
            <EditProjectPopup
              project={project}
              anchorEl={editProjectAnchorEl}
              onClose={handleCloseEditProject}
              onProjectUpdated={handleProjectUpdated}
            />
            <Popover
              id={exportPdfDatePopoverId}
              open={openExportPdfDate}
              anchorEl={exportPdfDateAnchorEl}
              onClose={handleCloseExportPdfDate}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                sx: { width: 200, p: 1, borderRadius: 1 },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ p: 1, fontWeight: "bold", textAlign: "center" }}
              >
                Esporta PDF per data
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mt: 1,
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {uniqueExtractionDates.length > 0 ? (
                  uniqueExtractionDates.map((dateStr) => (
                    <Button
                      key={dateStr}
                      variant="text"
                      onClick={() => handleExportPdfWithDate(dateStr)}
                      sx={{ justifyContent: "flex-start", py: 1 }}
                    >
                      {FormatDate(new Date(dateStr), "dd-MM-yyyy")}
                    </Button>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", p: 1 }}
                  >
                    Nessuna data disponibile.
                  </Typography>
                )}
              </Box>
            </Popover>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*.png"
              onChange={handleLogoChange}
              style={{ display: "none" }}
            />

            {projectLogo ? (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                onClick={handleLogoClick}
              >
                <img src={projectLogo}></img>
                <Typography variant="caption" color="text.secondary">
                  Clicca per cambiare
                </Typography>
              </Box>
            ) : (
              <Button
                variant="outlined"
                sx={{ minWidth: "120px", mb: 1 }}
                onClick={handleLogoClick}
                startIcon={<AddPhotoAlternateIcon />}
              >
                Insert logo
              </Button>
            )}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
            ></Box>
          </Grid>

          <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">Data inserimento:</Typography>
            </Box>
            <Typography variant="body1" fontWeight="bold">
              {FormatDate(project.dataInserimento, "dd-MM-yyyy")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 1,
                mt: 0.5,
              }}
            >
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">Data ultimo report:</Typography>
            </Box>
            <Typography variant="body1" fontWeight="bold">
              {FormatDate(
                project.dataEstrazione || project.dataKeyword,
                "dd-MM-yyyy"
              )}
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
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
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      labelId="search-engine-label"
                      value={searchEngine}
                      onChange={handleSearchEngineChange}
                    >
                      <MenuItem value="google.it - Italia">
                        google.it - Italia
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <IconButton
                    size="small"
                    onClick={handleOpenExportDate}
                    aria-describedby={exportDatePopoverId}
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleOpenExportPdfDate}
                    aria-describedby={exportPdfDatePopoverId}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleOpenAddKeyword}
                    aria-describedby={addKeywordPopoverId}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>

              <Popover
                id={exportDatePopoverId}
                open={openExportDate}
                anchorEl={exportDateAnchorEl}
                onClose={handleCloseExportDate}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: { width: 200, p: 1, borderRadius: 1 },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ p: 1, fontWeight: "bold", textAlign: "center" }}
                >
                  Seleziona la data di estrazione
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mt: 1,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {uniqueExtractionDates.length > 0 ? (
                    uniqueExtractionDates.map((dateStr) => (
                      <Button
                        key={dateStr}
                        variant="text"
                        onClick={() => handleExportCsvWithDate(dateStr)}
                        sx={{ justifyContent: "flex-start", py: 1 }}
                      >
                        {FormatDate(new Date(dateStr), "dd-MM-yyyy")}
                      </Button>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", p: 1 }}
                    >
                      Nessuna data disponibile.
                    </Typography>
                  )}
                </Box>
              </Popover>

              <Popover
                id={addKeywordPopoverId}
                open={openAddKeyword}
                anchorEl={addKeywordAnchorEl}
                onClose={handleCloseAddKeyword}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: { width: 400, borderRadius: 2 },
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <IconButton
                      sx={{
                        backgroundColor: "primary.main",
                        color: "white",
                        mr: 1,
                        p: "4px",
                      }}
                    >
                      <AddCircleOutlineIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h6">Nuova Key</Typography>
                  </Box>
                  <TextField
                    label="Keyword"
                    variant="filled"
                    size="small"
                    fullWidth
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleAddKeyword();
                    }}
                    sx={{ mb: 1, backgroundColor: "rgba(0, 0, 0, 0.06)" }}
                    InputProps={{ disableUnderline: true }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    Keywords inserite nel progetto
                  </Typography>
                  <Box
                    sx={{
                      height: 200,
                      overflowY: "auto",
                      mb: 2,
                      border: "1px solid #eee",
                      borderRadius: 1,
                      p: 1,
                      bgcolor: "#fff",
                    }}
                  >
                    {keywords.length > 0 ? (
                      keywords.map((kw) => (
                        <Box
                          key={kw.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            py: 0.5,
                            borderBottom: "1px solid #f5f5f5",
                            "&:last-child": { borderBottom: "none" },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              flexGrow: 1,
                              mr: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {kw.KeywordSerp_Keyword}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteKeyword(kw.id)}
                            aria-label="delete keyword"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: "center", mt: 2 }}
                      >
                        Nessuna keyword presente.
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      onClick={handleAddKeyword}
                      size="small"
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: "16px" }}
                    >
                      Aggiungi
                    </Button>
                  </Box>
                </Box>
              </Popover>
              <Box sx={{ height: 600, width: "100%" }}>
                <DataGrid
                  rows={keywords}
                  columns={keywordColumns}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  density="standard"
                  rowHeight={43}
                  getRowId={(row) => row.id}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                % Presenza url in pagina
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  height: "450px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Pie data={pieChartData} options={pieChartOptions} />
                <Typography
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "text.secondary",
                  }}
                >
                  {totalKeywordsInChart}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default ProjectDetail;
