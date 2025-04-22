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
          setKeywordsGraphics(keywordsData?.Itemset?.v_graphicdata || []);
        }

      } catch (err) {
        console.error("Error loading project details:", err);
        setError(err.message);
        setProject(null);
        setKeywords([]);
        setKeywordsGraphics([]);
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

  const handleExportCsv = () => {
    if (!keywords || keywords.length === 0) {
      console.log("No keywords to export.");
      return;
    }

    const headers = ["Keyword", "Posizione", "Variazione", "URL"];
    const csvRows = [
      headers.join(','), // Header row
      ...keywords.map(row => [
        `"${(row.KeywordSerp_Keyword || '').replace(/"/g, '""')}"`, // Escape double quotes
        row.KeywordSerp_Posizione ?? '',
        (row.KeywordSerp_Variazione === -999 || row.KeywordSerp_Variazione === "-999" || row.KeywordSerp_Variazione == null) ? '-' : row.KeywordSerp_Variazione ?? '',
        `"${(row.KeywordSerp_URL || '').replace(/"/g, '""')}"` // Escape double quotes
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    const filename = `keywords_${project?.ProgettiSerp_Nome || 'export'}_${FormatDate(new Date(), 'yyyyMMdd')}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddKeyword = Boolean(addKeywordAnchorEl);
  const addKeywordPopoverId = openAddKeyword ? 'add-keyword-popover' : undefined;

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
              <EditIcon fontSize="small" sx={{ cursor: 'pointer' }} />
              {project.ProgettiSerp_Nome || "Unnamed Project"}
            </Typography>
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

          {/* Right: Dates */}
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
            <Typography variant="body1" fontWeight="bold">{FormatDate(project.ProgettiSerp_UltimoReport || project.dataKeyword, 'dd-MM-yyyy')}</Typography>
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
                  <IconButton size="small" onClick={handleExportCsv}><SaveIcon /></IconButton>
                  <IconButton size="small"><EditIcon /></IconButton>
                  <IconButton size="small" onClick={handleOpenAddKeyword} aria-describedby={addKeywordPopoverId}><AddIcon /></IconButton>
                </Box>
              </Box>
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
                  sx: { width: 400, borderRadius: 2 } // Increased width from 300 to 400
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
          </Grid>

          {/* Right Column: Pie Chart */}
          <Grid item xs={12} md={4}>
            {/* Ensure content is INSIDE the Paper component */}
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
            </Paper> {/* Closing Paper tag */}
          </Grid> {/* Closing Grid tag */}
        </Grid>
      </Box>
    </Layout>
  );
};

export default ProjectDetail;
