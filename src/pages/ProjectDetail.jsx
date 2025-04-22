import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Paper, Grid, Select, MenuItem, FormControl, Avatar, Popover, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyIcon from '@mui/icons-material/Key';
import PeopleIcon from '@mui/icons-material/People';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../layout/Layout';
import useEnv from '../hooks/useEnv';
import { FormatDate } from '../utility/FormatDate';
import Loader from '../components/Loader';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { SERVERAPI } = useEnv();
  const token = localStorage.getItem("axo_token");
  const fileInputRef = useRef(null);

  const [project, setProject] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [keywordsGraphics, setKeywordsGraphics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchEngine, setSearchEngine] = useState('google.it - Italia');
  const [projectLogo, setProjectLogo] = useState(null);
  const [addKeywordAnchorEl, setAddKeywordAnchorEl] = useState(null);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [exportDateAnchorEl, setExportDateAnchorEl] = useState(null);
  const [uniqueExtractionDates, setUniqueExtractionDates] = useState([]);
  const [exportPdfDateAnchorEl, setExportPdfDateAnchorEl] = useState(null);

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

        if (projectData?.Itemset?.v_progettiserp && projectData.Itemset.v_progettiserp.length > 0) {
          setProject(projectData.Itemset.v_progettiserp[0]);
        } else {
          throw new Error('Project not found');
        }

        const keywordsUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggiKeyWords/${id}`;
        const keywordsResponse = await fetch(keywordsUrl);
        if (!keywordsResponse.ok) {
          console.error(`HTTP error fetching keywords! status: ${keywordsResponse.status}`);
          setKeywords([]);
          setKeywordsGraphics([]);
          setUniqueExtractionDates([]);
        } else {
          const keywordsData = await keywordsResponse.json();
          console.log("keywordsData", keywordsData);

          const keywordsWithId = (keywordsData?.Itemset?.v_keywords || []).map((kw, index) => ({
            id: kw.IDOBJ || index,
            KeywordSerp_Keyword: kw.KeywordSerp_Keyword || kw.keyword || kw.Keyword || "",
            KeywordSerp_Posizione: kw.KeywordSerp_Posizione || kw.posizione || kw.Posizione || "",
            KeywordSerp_Variazione: kw.KeywordSerp_Variazione || kw.variazione || kw.Variazione || "",
            KeywordSerp_URL: kw.urlkey || kw.KeywordSerp_URL || kw.url || kw.URL || "",
          }));
          setKeywords(keywordsWithId);

          // Log the raw v_keywords array before processing
          console.log("Raw v_keywords data:", keywordsData?.Itemset?.v_keywords); // <-- Add this log

          // Extract and sort unique extraction dates from keywords data
          const dates = keywordsData?.Itemset?.v_keywords 
            ?.map(item => item.dataestrazione) // <-- Use lowercase field name
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
      
      // Check file type
      if (!file.type.match('image.*')) {
        alert('Per favore seleziona un\'immagine');
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('L\'immagine non può superare i 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProjectLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddKeyword = (event) => {
    setAddKeywordAnchorEl(event.currentTarget);
  };

  const handleCloseAddKeyword = () => {
    setAddKeywordAnchorEl(null);
    setNewKeywordInput('');
  };

  const handleAddKeyword = () => {
    if (newKeywordInput.trim()) {
      const newKeyword = {
        id: `temp-${Date.now()}`,
        KeywordSerp_Keyword: newKeywordInput.trim(),
        KeywordSerp_Posizione: null,
        KeywordSerp_Variazione: null,
        KeywordSerp_URL: '',
      };
      setKeywords(prevKeywords => [...prevKeywords, newKeyword]);
      handleCloseAddKeyword();
      console.log("New keyword added (frontend only):", newKeyword);
    }
  };

  const handleDeleteKeyword = (keywordId) => {
    setKeywords(prevKeywords => prevKeywords.filter(kw => kw.id !== keywordId));
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
      headers.join(';'),
      ...keywords.map(row => [
        `"${(row.KeywordSerp_Keyword || '').replace(/"/g, '""')}"`,
        row.KeywordSerp_Posizione ?? '',
        (row.KeywordSerp_Variazione === -999 || row.KeywordSerp_Variazione === "-999" || row.KeywordSerp_Variazione == null) ? '-' : row.KeywordSerp_Variazione ?? '',
        `"${(row.KeywordSerp_URL || '').replace(/"/g, '""')}"`
      ].join(';'))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    const selectedDate = dateString ? FormatDate(new Date(dateString), 'yyyyMMdd') : FormatDate(new Date(), 'yyyyMMdd');
    const filename = `keywords_${project?.ProgettiSerp_Nome || 'export'}_${selectedDate}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

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

    // Filter keywords for positions 1-10
    const filteredKeywords = keywords.filter(kw => {
      const position = kw.KeywordSerp_Posizione;
      return typeof position === 'number' && position >= 1 && position <= 10; 
    });

    if (filteredKeywords.length === 0) {
      console.log("No keywords found in positions 1-10 to export for PDF."); 
      alert("Nessuna keyword trovata nelle posizioni 1-10 per questa data."); 
      handleCloseExportPdfDate();
      return;
    }

    // Change orientation back to 'landscape'
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' }); 
    const selectedDate = dateString ? FormatDate(new Date(dateString), 'dd-MM-yyyy') : FormatDate(new Date(), 'dd-MM-yyyy');
    const filenameBase = `keywords_${project?.ProgettiSerp_Nome || 'export'}_${selectedDate}_pos1-10`;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // --- !! IMPORTANT !! ---
    // Replace this placeholder with the actual base64 data URL of your logo image
    const logoImageDataUrl = projectLogo || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'; // Placeholder for logo image
    // --- Header Function ---
    const drawHeader = (data) => {
      const logoWidth = 50; // Adjust width as needed (in mm)
      const logoHeight = 15; // Adjust height as needed (in mm)
      const logoX = margin;
      const logoY = margin - 5; // Adjust Y position if needed

      try {
        // Add the image using the data URL
        doc.addImage(logoImageDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (error) {
        console.error("Error adding image to PDF:", error);
        // Fallback or alternative text if image fails
        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0); // Red color for error indication
        doc.text("Error loading logo", logoX, logoY + logoHeight / 2);
      }
    };

    // --- Footer Function ---
    const drawFooter = (data) => {
      const footerY = pageHeight - margin - 5; // Position higher
      const colWidth = (pageWidth - 2 * margin) / 4; // Adjust width based on margins
      doc.setFontSize(7); // Smaller font size
      doc.setTextColor(80, 80, 80);
      doc.setLineWidth(0.2);
      doc.setDrawColor(120, 180, 70); // Line color
      doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2); // Line above footer

      // Colonna 1: HUB
      doc.setFont(undefined, 'bold');
      doc.text("HUB", margin, footerY + 2); // Adjusted Y
      doc.setFont(undefined, 'normal');
      doc.text("VIA COSIMO DEL FRATE, 16", margin, footerY + 5); // Adjusted Y
      doc.text("LEGNANO (MI)", margin, footerY + 8); // Adjusted Y

      // Colonna 2: CUBE
      const col2X = margin + colWidth;
      doc.setFont(undefined, 'bold');
      doc.text("CUBE [CORE] ROOM", col2X, footerY + 2); // Adjusted Y
      doc.setFont(undefined, 'normal');
      doc.text("VIA MONTE NAPOLEONE, 22", col2X, footerY + 5); // Adjusted Y
      doc.text("MILANO", col2X, footerY + 8); // Adjusted Y

      // Colonna 3: SEDE LEGALE
      const col3X = margin + colWidth * 2;
      doc.setFont(undefined, 'bold');
      doc.text("SEDE LEGALE", col3X, footerY + 2); // Adjusted Y
      doc.setFont(undefined, 'normal');
      doc.text("VIA I BOSSI, 46", col3X, footerY + 5); // Adjusted Y
      doc.text("RESCALDINA (MI)", col3X, footerY + 8); // Adjusted Y

      // Colonna 4: Contatti
      const col4X = margin + colWidth * 3;
      doc.setFont(undefined, 'bold');
      doc.text("www.ampartners.info", col4X, footerY + 2); // Adjusted Y
      doc.setFont(undefined, 'normal');
      doc.text("info@ampartners.info", col4X, footerY + 5); // Adjusted Y

      // Page number (optional)
      // doc.setFontSize(8);
      // doc.text(`Pagina ${data.pageNumber}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    };


    // --- Define Table Columns and Rows ---
    const tableColumn = ["PAROLA CHIAVE", "POSIZIONE SU GOOGLE", "PAGINA SITO POSIZIONATA"]; // Updated columns
    const tableRows = [];

    filteredKeywords.forEach(kw => {
      const keywordData = [
        kw.KeywordSerp_Keyword || '',
        kw.KeywordSerp_Posizione ?? '', // Position will always be 1-10 here
        // Removed Variazione
        kw.KeywordSerp_URL || ''
      ];
      tableRows.push(keywordData);
    });

    // --- Generate Table with Header/Footer on each page ---
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: margin + 15, // Start table below header space
      theme: 'grid', // Change theme back to 'grid'
      styles: {
        fontSize: 8,
        cellPadding: 1.5, // Keep padding or adjust as needed
        valign: 'middle',
      },
      headStyles: {
        fillColor: [22, 160, 133], // Apply green background color
        textColor: [255, 255, 255], // White text color
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center', // Center align header text like the image
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' }, // Keyword - Left aligned
        1: { cellWidth: 30, halign: 'center' }, // Position - Center aligned
        2: { cellWidth: 'auto', halign: 'left' } // URL - Left aligned
      },
      didDrawPage: (data) => {
        // Draw header and footer on every page the table spans
        drawHeader(data);
        drawFooter(data);
      },
      margin: { top: margin + 10, bottom: margin + 15, left: margin, right: margin } 
    });

    doc.save(`${filenameBase}.pdf`);
    handleCloseExportPdfDate();
  };

  const openAddKeyword = Boolean(addKeywordAnchorEl);
  const addKeywordPopoverId = openAddKeyword ? 'add-keyword-popover' : undefined;
  const openExportDate = Boolean(exportDateAnchorEl);
  const exportDatePopoverId = openExportDate ? 'export-date-popover' : undefined;
  const openExportPdfDate = Boolean(exportPdfDateAnchorEl);
  const exportPdfDatePopoverId = openExportPdfDate ? 'export-pdf-date-popover' : undefined;

  const keywordColumns = [
    { field: 'KeywordSerp_Keyword', headerName: 'Keywords', flex: 1, minWidth: 200 },
    { field: 'KeywordSerp_Posizione', headerName: 'Posizione', width: 100, align: 'center', headerAlign: 'center' },
    {
      field: 'KeywordSerp_Variazione',
      headerName: 'Variazione',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (value, row) => {
        if (value === -999 || value === "-999" || value == null) {
          return '-';
        }
        return value;
      }
    },
    { field: 'KeywordSerp_URL', headerName: 'URL', flex: 1, minWidth: 250 },
  ];

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Layout showSearchBar={false}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">Error loading project: {error}</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick} sx={{ mt: 2 }}>
            Indietro
          </Button>
        </Box>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout showSearchBar={false}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Project not found.</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick} sx={{ mt: 2 }}>
            Indietro
          </Button>
        </Box>
      </Layout>
    );
  }

  const positionData = {
    pos1_10: keywords.filter(k => k.KeywordSerp_Posizione >= 1 && k.KeywordSerp_Posizione <= 10).length,
    pos11_20: keywords.filter(k => k.KeywordSerp_Posizione >= 11 && k.KeywordSerp_Posizione <= 20).length,
    pos21_50: keywords.filter(k => k.KeywordSerp_Posizione >= 21 && k.KeywordSerp_Posizione <= 50).length,
    pos_gt_50: keywords.filter(k => k.KeywordSerp_Posizione > 50).length,
    pos_undefined: keywords.filter(k => k.KeywordSerp_Posizione == null || k.KeywordSerp_Posizione === "" || k.KeywordSerp_Posizione <= 0).length,
  };
  const totalKeywordsInChart = keywords.length;

  const pieChartData = {
    labels: [
      `Pos. 1-10 (${positionData.pos1_10})`,
      `Pos. 11-20 (${positionData.pos11_20})`,
      `Pos. 21-50 (${positionData.pos21_50})`,
      `Pos. > 50 (${positionData.pos_gt_50})`,
      `Non definite (${positionData.pos_undefined})`
    ],
    datasets: [
      {
        label: '% Presenza URL',
        data: [
          positionData.pos1_10,
          positionData.pos11_20,
          positionData.pos21_50,
          positionData.pos_gt_50,
          positionData.pos_undefined
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)'
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
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const value = context.parsed;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
              label += `${value} (${percentage})`;
            }
            return label;
          }
        }
      }
    },
    cutout: '60%',
  };

  return (
    <Layout showSearchBar={false}>
      <Box sx={{ p: 3 }}>
        {/* Top Section */}
        <Grid container spacing={2} sx={{ mb: 3, alignItems: 'flex-start' }}>
          {/* Left: Project Name */}
          <Grid item xs={12} md={4}>
            <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {project.ProgettiSerp_Nome || "Unnamed Project"}
            </Typography>
            {/* PDF Export Date Popover */}
            <Popover
              id={exportPdfDatePopoverId}
              open={openExportPdfDate}
              anchorEl={exportPdfDateAnchorEl}
              onClose={handleCloseExportPdfDate}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              PaperProps={{
                sx: { width: 200, p: 1, borderRadius: 1 }
              }}
            >
              <Typography variant="subtitle1" sx={{ p: 1, fontWeight: 'bold', textAlign: 'center' }}>
                Esporta PDF per data
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, maxHeight: 200, overflowY: 'auto' }}>
                {uniqueExtractionDates.length > 0 ? (
                  uniqueExtractionDates.map((dateStr) => (
                    <Button
                      key={dateStr}
                      variant="text"
                      onClick={() => handleExportPdfWithDate(dateStr)}
                      sx={{ justifyContent: 'flex-start', py: 1 }}
                    >
                      {FormatDate(new Date(dateStr), 'dd-MM-yyyy')}
                    </Button>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 1 }}>
                    Nessuna data disponibile.
                  </Typography>
                )}
              </Box>
            </Popover>
            {/* End PDF Export Date Popover */}
          </Grid>

          {/* Center: Logo and Team */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />
            
            {projectLogo ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar
                  src={projectLogo}
                  alt="Project logo"
                  sx={{ width: 48, height: 48, cursor: 'pointer', border: '1px solid #eee' }}
                  onClick={handleLogoClick}
                />
                <Typography variant="caption" color="text.secondary">
                  Clicca per cambiare
                </Typography>
              </Box>
            ) : (
              <Button
                variant="outlined"
                sx={{ minWidth: '120px', mb: 1 }}
                onClick={handleLogoClick}
                startIcon={<AddPhotoAlternateIcon />}
              >
                Insert logo
              </Button>
            )}
            {/* Placeholder for Team Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              
              
            </Box>
          </Grid>

          
                <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                  <CalendarTodayIcon fontSize="small" />
                  <Typography variant="body2">Data inserimento:</Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold">{FormatDate(project.dataInserimento, 'dd-MM-yyyy')}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
                  <CalendarTodayIcon fontSize="small" />
                  <Typography variant="body2">Data ultimo report:</Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold">{FormatDate(project.dataEstrazione || project.dataKeyword, 'dd-MM-yyyy')}</Typography>
                </Grid>
              </Grid>

              {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column: Keywords Table */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <KeyIcon />
                  <Typography variant="h6">Totale Keywords</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      labelId="search-engine-label"
                      value={searchEngine}
                      onChange={handleSearchEngineChange}
                    >
                      <MenuItem value="google.it - Italia">google.it - Italia</MenuItem>
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
                  <IconButton size="small" onClick={handleOpenAddKeyword} aria-describedby={addKeywordPopoverId}><AddIcon /></IconButton>
                </Box>
              </Box>
              
              {/* Export Date Popover */}
              <Popover
                id={exportDatePopoverId}
                open={openExportDate}
                anchorEl={exportDateAnchorEl}
                onClose={handleCloseExportDate}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: { width: 200, p: 1, borderRadius: 1 }
                }}
              >
                <Typography variant="subtitle1" sx={{ p: 1, fontWeight: 'bold', textAlign: 'center' }}>
                  Seleziona la data di estrazione
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, maxHeight: 200, overflowY: 'auto' }}>
                  {uniqueExtractionDates.length > 0 ? (
                    uniqueExtractionDates.map((dateStr) => (
                      <Button
                        key={dateStr}
                        variant="text"
                        onClick={() => handleExportCsvWithDate(dateStr)}
                        sx={{ justifyContent: 'flex-start', py: 1 }}
                      >
                        {FormatDate(new Date(dateStr), 'dd-MM-yyyy')}
                      </Button>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 1 }}>
                      Nessuna data disponibile.
                    </Typography>
                  )}
                </Box>
              </Popover>
              
              {/* Popover for adding keywords */}
              <Popover
                id={addKeywordPopoverId}
                open={openAddKeyword}
                anchorEl={addKeywordAnchorEl}
                onClose={handleCloseAddKeyword}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: { width: 400, borderRadius: 2 }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton sx={{ backgroundColor: 'primary.main', color: 'white', mr: 1, p: '4px' }}>
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
                    onKeyPress={(e) => { if (e.key === 'Enter') handleAddKeyword(); }}
                    sx={{ mb: 1, backgroundColor: 'rgba(0, 0, 0, 0.06)' }}
                    InputProps={{ disableUnderline: true }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Keywords inserite nel progetto
                  </Typography>
                  <Box sx={{ height: 200, overflowY: 'auto', mb: 2, border: '1px solid #eee', borderRadius: 1, p: 1, bgcolor: '#fff' }}>
                    {keywords.length > 0 ? (
                      keywords.map((kw) => (
                        <Box
                          key={kw.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 0.5,
                            borderBottom: '1px solid #f5f5f5',
                            '&:last-child': { borderBottom: 'none' }
                          }}
                        >
                          <Typography variant="body2" sx={{ flexGrow: 1, mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                        Nessuna keyword presente.
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={handleAddKeyword}
                      size="small"
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: '16px' }}
                    >
                      Aggiungi
                    </Button>
                  </Box>
                </Box>
              </Popover>
              {/* End Popover */}
              <Box sx={{ height: 600, width: '100%' }}>
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
          </Grid> {/* Closing tag for Left Column Grid item */}

          {/* Right Column: Pie Chart */}
          <Grid item xs={12} md={4}> {/* Opening tag */}
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>% Presenza url in pagina</Typography>
              <Box sx={{ position: 'relative', height: '450px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Pie data={pieChartData} options={pieChartOptions} />
                <Typography
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'text.secondary'
                  }}
                >
                  {totalKeywordsInChart}
                </Typography>
              </Box>
            </Paper>
          </Grid> {/* Ensure this closing tag exists and corresponds to the <Grid item xs={12} md={4}> */}
        </Grid> {/* Closing tag for Main Content Grid container */}
      </Box>
    </Layout>
  );
};

export default ProjectDetail;
