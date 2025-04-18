import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Paper, Grid, Select, MenuItem, FormControl } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyIcon from '@mui/icons-material/Key';
import PeopleIcon from '@mui/icons-material/People';
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

  const [project, setProject] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [keywordsGraphics, setKeywordsGraphics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchEngine, setSearchEngine] = useState('google.it - Italia');

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
          setKeywordsGraphics(keywordsData.Itemset.v_graphicdata || []);
        }

      } catch (err) {
        console.error("Error loading project details:", err);
        setError(err.message);
        setProject(null);
        setKeywords([]);
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
      <Layout>
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
      <Layout>
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
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick}>
            Indietro
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button variant="outlined" sx={{ minWidth: '120px' }}>Insert logo</Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon />
              <Typography variant="h6">Team</Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
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
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon fontSize="small" sx={{ cursor: 'pointer' }} />
            {project.ProgettiSerp_Nome || "Unnamed Project"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {project.ProgettiSerp_DNS || "No domain"}
          </Typography>
        </Box>

        <Grid container spacing={3}>
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
                  <IconButton size="small"><SaveIcon /></IconButton>
                  <IconButton size="small"><EditIcon /></IconButton>
                  <IconButton size="small"><AddIcon /></IconButton>
                </Box>
              </Box>
              <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                  rows={keywords}
                  columns={keywordColumns}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  density="compact"
                  getRowId={(row) => row.id}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>% Presenza url in pagina</Typography>
              <Box sx={{ position: 'relative', height: '300px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default ProjectDetail;
