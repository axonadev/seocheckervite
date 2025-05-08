import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, FormControl, Select, MenuItem, InputLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { calculateKeywordPositionData } from "../utility/chartUtils";
import ProjectNotes from "./ProjectNotes";
import useEnv from "../hooks/useEnv";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const KeywordPositionChart = ({ keywords, projectId, token }) => {
  const { SERVERAPI } = useEnv();
  const [selectedDate, setSelectedDate] = useState('current');
  const [availableDates, setAvailableDates] = useState([]);
  const [historicalKeywords, setHistoricalKeywords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [keywordsByMonth, setKeywordsByMonth] = useState({});
  
  // Stati per il modale di confronto
  const [openCompareModal, setOpenCompareModal] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [openFullScreenModal, setOpenFullScreenModal] = useState(false);
  const [comparisonType, setComparisonType] = useState('months'); // 'months' o 'urls'
  const [selectedUrls, setSelectedUrls] = useState([]);

  // Carica solo le date disponibili all'avvio
  useEffect(() => {
    if (projectId && token) {
      fetchAvailableDates();
    }
  }, [projectId, token, SERVERAPI]);

  // Funzione per caricare solo le date disponibili
  const fetchAvailableDates = async () => {
    try {
      const keywordsUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggiKeyWords/${projectId}`;
      const response = await fetch(keywordsUrl);
      
      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.Itemset?.v_keywords && Array.isArray(data.Itemset.v_keywords)) {
        // Organizziamo i dati per mese
        const keywordsByMonthMap = {};
        data.Itemset.v_keywords.forEach(kw => {
          if (kw.dataestrazione) {
            const date = new Date(kw.dataestrazione);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!keywordsByMonthMap[monthKey]) {
              keywordsByMonthMap[monthKey] = [];
            }
            keywordsByMonthMap[monthKey].push(kw);
          }
        });

        // Ordina i mesi cronologicamente
        const sortedMonths = Object.keys(keywordsByMonthMap).sort();
        
        // Calcola i dati cumulativi per ogni mese
        const cumulativeDataByMonth = {};
        let previousKeywords = [];
        
        sortedMonths.forEach(month => {
          // Aggiungi le keyword del mese corrente a quelle precedenti
          previousKeywords = [...previousKeywords, ...keywordsByMonthMap[month]];
          cumulativeDataByMonth[month] = [...previousKeywords];
        });
        
        // Aggiorniamo lo stato con i dati cumulativi
        setKeywordsByMonth(cumulativeDataByMonth);
        
        // Estraiamo le date uniche per il menu a tendina, ordinate dalla più recente
        const uniqueMonths = sortedMonths.reverse(); // Reverse per avere i più recenti prima
        setAvailableDates(uniqueMonths);
      }
    } catch (error) {
      console.error("Errore nel recupero delle date:", error);
    }
  };

  // Funzione per caricare i dati di un mese specifico
  const fetchMonthData = async (monthKey) => {
    try {
      setIsLoading(true);
      const keywordsUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggiKeyWords/${projectId}`;
      const response = await fetch(keywordsUrl);
      
      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.Itemset?.v_keywords && Array.isArray(data.Itemset.v_keywords)) {
        const selectedDate = new Date(monthKey);
        const monthKeywords = data.Itemset.v_keywords.filter(kw => {
          if (kw.dataestrazione) {
            const keywordDate = new Date(kw.dataestrazione);
            return keywordDate.getFullYear() === selectedDate.getFullYear() && 
                   keywordDate.getMonth() === selectedDate.getMonth();
          }
          return false;
        });
        
        setKeywordsByMonth(prev => ({
          ...prev,
          [monthKey]: monthKeywords
        }));
        
        return monthKeywords;
      }
      return [];
    } catch (error) {
      console.error("Errore nel recupero dei dati del mese:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Estrae tutte le date uniche dalle keyword e le formatta come mesi per il menu a tendina
  const extractUniqueDates = (keywords) => {
    // Ottiene tutte le date di estrazione dalle keyword
    const allDates = keywords
      .map(kw => kw.dataestrazione)
      .filter(date => date); // Filtra date nulle
    
    // Converte ogni data nel formato "YYYY-MM-01" (primo giorno del mese)
    const monthDates = allDates.map(dateStr => {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    });
    
    // Rimuove i duplicati e ordina le date dal più recente al più vecchio
    const uniqueMonths = [...new Set(monthDates)]
      .sort((a, b) => new Date(b) - new Date(a));
    
    console.log("Date uniche estratte dalle keyword:", uniqueMonths);
    return uniqueMonths;
  };

  // Gestisce il cambiamento della data selezionata
  const handleDateChange = async (event) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    
    if (newDate === 'current') {
      setHistoricalKeywords(null);
      return;
    }
    
    // Usa i dati cumulativi già calcolati
    setHistoricalKeywords(keywordsByMonth[newDate]);
  };

  // Formatta il testo della data per la visualizzazione nel menu
  const formatDateLabel = (dateStr) => {
    if (dateStr === 'current') return "Data corrente";
    
    const date = new Date(`${dateStr}-01`); // Aggiungiamo -01 per avere una data valida
    return date.toLocaleString('it-IT', { 
      month: 'long', 
      year: 'numeric'
    });
  };

  // Determina quali keyword usare per il grafico
  const keywordsToUse = selectedDate === 'current' || !historicalKeywords ? keywords : historicalKeywords;

  // Use the utility function to calculate data
  const { positionData, totalKeywords: totalKeywordsInChart } = calculateKeywordPositionData(keywordsToUse);

  // Construct pieChartData using the results from the utility function
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

  // Funzione per aprire il modale di confronto
  const openComparisonModal = () => {
    setOpenCompareModal(true);
  };

  // Funzione per chiudere il modale di confronto
  const closeComparisonModal = () => {
    setOpenCompareModal(false);
  };

  // Funzione per gestire la selezione dei mesi per il confronto
  const handleMonthSelect = (month) => {
    const currentIndex = selectedMonths.indexOf(month);
    const newSelectedMonths = [...selectedMonths];
    
    if (currentIndex === -1) {
      // Aggiungi il mese se non è già selezionato
      newSelectedMonths.push(month);
    } else {
      // Rimuovi il mese se è già selezionato
      newSelectedMonths.splice(currentIndex, 1);
    }
    
    setSelectedMonths(newSelectedMonths);
  };

  // Funzione per generare colori contrastanti per il confronto
  const getContrastColors = (index) => {
    const colors = [
      { bg: "rgba(255, 99, 132, 0.6)", border: "rgba(255, 99, 132, 1)" },      
      { bg: "rgba(54, 162, 235, 0.6)", border: "rgba(54, 162, 235, 1)" },      
      { bg: "rgba(255, 206, 86, 0.6)", border: "rgba(255, 206, 86, 1)" },      // Giallo
      { bg: "rgba(75, 192, 192, 0.6)", border: "rgba(75, 192, 192, 1)" },      // Verde acqua
      { bg: "rgba(153, 102, 255, 0.6)", border: "rgba(153, 102, 255, 1)" },    // Viola
      { bg: "rgba(255, 159, 64, 0.6)", border: "rgba(255, 159, 64, 1)" },      // Arancione
      { bg: "rgba(201, 203, 207, 0.6)", border: "rgba(201, 203, 207, 1)" },    // Grigio
      { bg: "rgba(255, 0, 0, 0.6)", border: "rgba(255, 0, 0, 1)" },            // Rosso puro
      { bg: "rgba(0, 255, 0, 0.6)", border: "rgba(0, 255, 0, 1)" },            // Verde puro
      { bg: "rgba(0, 0, 255, 0.6)", border: "rgba(0, 0, 255, 1)" },            // Blu puro
    ];
    return colors[index % colors.length];
  };

  // Funzione per eseguire il confronto tra i mesi selezionati
  const compareSelectedItems = async () => {
    if (comparisonType === 'months') {
      if (selectedMonths.length < 2) {
        alert("Seleziona almeno due date per il confronto.");
        return;
      }
    }
    
    setIsLoading(true);
    
    let comparisonData;
    if (comparisonType === 'months') {
      // Usa direttamente i dati dalle date selezionate
      const keywordsData = selectedMonths.map(date => {
        if (date === 'current') {
          return keywords; // Usa i dati attuali
        }
        return keywordsByMonth[date] || [];
      });
      
      // Calcola i dati di confronto per ogni mese selezionato
      comparisonData = {
        labels: ['Pos. 1-10', 'Pos. 11-20', 'Pos. 21-50', 'Pos. > 50', 'Non definite'],
        datasets: selectedMonths.map((month, index) => {
          const dateData = calculateKeywordPositionData(keywordsData[index]).positionData;
          const colors = getContrastColors(index);
          return {
            label: formatDateLabel(month),
            data: [
              dateData.pos1_10,
              dateData.pos11_20, 
              dateData.pos21_50,
              dateData.pos_gt_50,
              dateData.pos_undefined
            ],
            backgroundColor: colors.bg,
            borderColor: colors.border,
            borderWidth: 1
          };
        })
      };
    } else {
      comparisonData = getUrlComparisonData();
    }
    
    setComparisonData(comparisonData);
    setOpenCompareModal(false);
    setOpenFullScreenModal(true);
    setIsLoading(false);
  };

  // Funzione per ottenere dati confronto URL
  const getUrlComparisonData = () => {
    const selectedDates = selectedMonths;
    
    // Ottieni tutte le URL uniche
    const allUrls = Array.from(new Set(keywords.map(kw => kw.KeywordSerp_URL || kw.urlkey))).filter(url => url);
    
    // Per ogni data selezionata, conta le occorrenze di ogni URL
    const datasets = selectedDates.map((date, dateIndex) => {
      // Prendi le keyword della data selezionata
      const dateKeywords = date === 'current' ? keywords : keywordsByMonth[date] || [];
      
      // Conta le occorrenze per ogni URL
      const urlCounts = {};
      dateKeywords.forEach(kw => {
        const url = kw.KeywordSerp_URL || kw.urlkey || '';
        const keyword = kw.KeywordSerp_Keyword || kw.keyword || '';
        if (url && keyword) {
          urlCounts[url] = (urlCounts[url] || 0) + 1;
        }
      });
      
      // Crea il dataset per questa data
      const colors = getContrastColors(dateIndex);
      return {
        label: formatDateLabel(date),
        data: allUrls.map(url => urlCounts[url] || 0),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1
      };
    });

    return {
      labels: allUrls,
      datasets: datasets
    };
  };

  // Funzione per esportare i dati in CSV
  const exportToCSV = () => {
    if (comparisonType !== 'urls' || !comparisonData) return;

    // Prepara l'header con le date selezionate
    const headers = ['URL', ...selectedMonths.map(date => formatDateLabel(date))];
    
    // Prepara le righe dei dati
    const rows = comparisonData.labels.map((url, urlIndex) => {
      return [
        url,
        ...comparisonData.datasets.map(dataset => dataset.data[urlIndex])
      ];
    });

    // Crea il contenuto CSV
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    // Crea e scarica il file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `confronto_url_${selectedMonths.join('_vs_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header con titolo e pulsanti */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={openComparisonModal}
            startIcon={<CompareArrowsIcon />}
          >
            Confronta
          </Button>
        </Box>
        
        <Typography variant="h6" sx={{ textAlign: "center", flex: 1 }}>
          % Presenza url in pagina
        </Typography>

        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="historical-date-select-label">Seleziona data</InputLabel>
          <Select
            labelId="historical-date-select-label"
            id="historical-date-select"
            value={selectedDate}
            onChange={handleDateChange}
            label="Seleziona data"
          >
            <MenuItem value="current">Data corrente</MenuItem>
            {availableDates.map((date) => (
              <MenuItem key={date} value={date}>
                {formatDateLabel(date)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box
        sx={{
          position: "relative",
          height: "450px", // Adjust height as needed
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <Typography>Caricamento dati...</Typography>
        ) : (
          <>
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
          </>
        )}
      </Box>
      
      {/* Box note progetto sotto la legenda/grafico */}
      <Box sx={{ width: '100%', mt: 3 }}>
        <ProjectNotes projectId={projectId} token={token} />
      </Box>
      
      {/* Modale di confronto tra mesi */}
      <Dialog
        open={openCompareModal}
        onClose={closeComparisonModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Confronta
          <IconButton
            aria-label="close"
            onClick={closeComparisonModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Tipo di confronto</InputLabel>
            <Select
              value={comparisonType}
              onChange={(e) => {
                setComparisonType(e.target.value);
                setSelectedMonths([]);
                setSelectedUrls([]);
              }}
              label="Tipo di confronto"
            >
              <MenuItem value="months">Confronto per mesi</MenuItem>
              <MenuItem value="urls">Confronto per URL</MenuItem>
            </Select>
          </FormControl>

          {comparisonType === 'months' ? (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Seleziona i mesi da confrontare:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4} md={3}>
                  <Button
                    variant={selectedMonths.includes('current') ? "contained" : "outlined"}
                    onClick={() => handleMonthSelect('current')}
                    sx={{ width: "100%" }}
                  >
                    Data attuale
                  </Button>
                </Grid>
                {Object.keys(keywordsByMonth).map((month) => (
                  <Grid item xs={6} sm={4} md={3} key={month}>
                    <Button
                      variant={selectedMonths.includes(month) ? "contained" : "outlined"}
                      onClick={() => handleMonthSelect(month)}
                      sx={{ width: "100%" }}
                    >
                      {formatDateLabel(month)}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Seleziona i mesi da confrontare per vedere l'evoluzione delle URL:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4} md={3}>
                  <Button
                    variant={selectedMonths.includes('current') ? "contained" : "outlined"}
                    onClick={() => handleMonthSelect('current')}
                    sx={{ width: "100%" }}
                  >
                    Data attuale
                  </Button>
                </Grid>
                {Object.keys(keywordsByMonth).map((month) => (
                  <Grid item xs={6} sm={4} md={3} key={month}>
                    <Button
                      variant={selectedMonths.includes(month) ? "contained" : "outlined"}
                      onClick={() => handleMonthSelect(month)}
                      sx={{ width: "100%" }}
                    >
                      {formatDateLabel(month)}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeComparisonModal} color="primary">
            Annulla
          </Button>
          <Button 
            onClick={compareSelectedItems}
            color="primary" 
            variant="contained"
            disabled={selectedMonths.length < 2}
          >
            Confronta
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modale a tutto schermo per il confronto */}
      <Dialog
        open={openFullScreenModal}
        onClose={() => setOpenFullScreenModal(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          style: {
            height: "100vh",
            width: "100vw",
            margin: 0,
            borderRadius: 0,
          },
        }}
      >
        <DialogTitle>
          {comparisonType === 'months' ? 'Confronto tra mesi' : 'Confronto URL nel tempo'}
          <Box sx={{ position: 'absolute', right: 48, top: 8, display: 'flex', gap: 1 }}>
            {comparisonType === 'urls' && (
              <Button
                variant="outlined"
                size="small"
                onClick={exportToCSV}
              >
                Esporta CSV
              </Button>
            )}
            <IconButton
              aria-label="close"
              onClick={() => setOpenFullScreenModal(false)}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {comparisonType === 'months' ? 'Confronto dati keyword' : 'Evoluzione delle URL nel tempo'}
          </Typography>
          
          <Box sx={{ width: "100%", height: comparisonType === 'months' ? 
            `${Math.max(500, selectedMonths.length * 100)}px` : 
            `${Math.max(500, Object.keys(getUrlComparisonData().labels).length * 50)}px`, 
            mb: 2 }}>
            <Bar
              data={comparisonData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      boxWidth: 12,
                      padding: 15,
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        let label = context.dataset.label || "";
                        if (label) {
                          label += ": ";
                        }
                        if (context.parsed.x !== null) {
                          const value = context.parsed.x;
                          label += `${value} occorrenze`;
                        }
                        return label;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Numero di occorrenze'
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: comparisonType === 'months' ? 'Posizione' : 'URL'
                    }
                  }
                }
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default KeywordPositionChart;
