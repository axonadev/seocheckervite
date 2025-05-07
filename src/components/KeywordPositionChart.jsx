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
  // Salva i dati storici per mese per evitare richieste multiple per lo stesso mese
  const [keywordsByMonth, setKeywordsByMonth] = useState({});
  const [allHistoricalKeywords, setAllHistoricalKeywords] = useState([]);
  
  // Stati per il modale di confronto
  const [openCompareModal, setOpenCompareModal] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  // Aggiungi uno stato per il modale fullscreen
  const [openFullScreenModal, setOpenFullScreenModal] = useState(false);

  // Carica tutti i dati storici una volta all'inizio
  useEffect(() => {
    if (projectId && token) {
      fetchAllHistoricalKeywords();
    }
  }, [projectId, token, SERVERAPI]);

  // Carica tutti i dati storici delle keywords
  const fetchAllHistoricalKeywords = async () => {
    try {
      console.log("Caricamento di tutti i dati storici delle keywords");
      setIsLoading(true);
      
      // Chiamata API per ottenere tutti i dati delle keyword
      const keywordsUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggiKeyWords/${projectId}`;
      const response = await fetch(keywordsUrl);
      
      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.Itemset && data.Itemset.v_keywords && Array.isArray(data.Itemset.v_keywords)) {
        console.log(`Caricate ${data.Itemset.v_keywords.length} keyword storiche totali`);
        
        // Mappa le keyword per garantire la compatibilità con calculateKeywordPositionData
        const mappedKeywords = data.Itemset.v_keywords.map(kw => ({
          ...kw,
          KeywordSerp_Posizione: kw.posizione || kw.KeywordSerp_Posizione || null
        }));
        
        setAllHistoricalKeywords(mappedKeywords);
        
        // Estrai tutte le date uniche dalle keyword e costruisci il menu a tendina
        const uniqueDates = extractUniqueDates(mappedKeywords);
        setAvailableDates(uniqueDates);
        
        // Organizza le keyword per mese per uso futuro
        const keywordsByMonthMap = {};
        mappedKeywords.forEach(kw => {
          if (kw.dataestrazione) {
            const dateObj = new Date(kw.dataestrazione);
            const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-01`;
            
            if (!keywordsByMonthMap[monthKey]) {
              keywordsByMonthMap[monthKey] = [];
            }
            keywordsByMonthMap[monthKey].push(kw);
          }
        });
        
        setKeywordsByMonth(keywordsByMonthMap);
      } else if (data && data.Itemset && data.Itemset.SEO_STATKEYWORDS) {
        console.log("Formato alternativo della risposta, nessuna keyword trovata");
      } else {
        console.log("Formato risposta non riconosciuto o nessuna keyword trovata");
      }
    } catch (error) {
      console.error("Errore nel recupero dei dati storici:", error);
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
      // Usa i dati correnti
      setHistoricalKeywords(null);
      return;
    }
    
    // Calcola le keyword cumulative fino alla data selezionata
    const selectedDateObj = new Date(newDate);
    
    // Filtra tutte le keyword con data di estrazione fino al mese selezionato
    const cumulativeKeywords = allHistoricalKeywords.filter(kw => {
      if (kw.dataestrazione) {
        const keywordDate = new Date(kw.dataestrazione);
        // Considera solo le keyword fino al mese selezionato (incluso)
        return (
          keywordDate.getFullYear() < selectedDateObj.getFullYear() || 
          (keywordDate.getFullYear() === selectedDateObj.getFullYear() && 
           keywordDate.getMonth() <= selectedDateObj.getMonth())
        );
      }
      return false;
    });
    
    console.log(`Trovate ${cumulativeKeywords.length} keyword cumulative fino a ${formatDateLabel(newDate)}`);
    
    // Se non ci sono keyword cumulative, mostra un array vuoto
    if (cumulativeKeywords.length === 0) {
      console.log("Nessuna keyword trovata fino alla data selezionata");
      setHistoricalKeywords([]);
    } else {
      // Usa tutte le keyword cumulative senza rimuovere i duplicati
      setHistoricalKeywords(cumulativeKeywords);
    }
  };

  // Formatta il testo della data per la visualizzazione nel menu
  const formatDateLabel = (dateStr) => {
    if (dateStr === 'current') return "Data corrente";
    
    const date = new Date(dateStr);
    const month = date.toLocaleString('it-IT', { month: 'long' });
    const year = date.getFullYear();
    
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
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

  // Funzione per eseguire il confronto tra i mesi selezionati
  const compareSelectedMonths = () => {
    if (selectedMonths.length !== 2) {
      alert("Seleziona esattamente due mesi per il confronto.");
      return;
    }
    
    // Estrai i dati delle keyword per i mesi selezionati
    const [month1, month2] = selectedMonths;
    const keywordsMonth1 = keywordsByMonth[month1] || [];
    const keywordsMonth2 = keywordsByMonth[month2] || [];
    
    // Calcola i dati di confronto per entrambi i mesi separatamente
    const month1Data = calculateKeywordPositionData(keywordsMonth1).positionData;
    const month2Data = calculateKeywordPositionData(keywordsMonth2).positionData;
    
    // Prepara i dati per la visualizzazione del confronto
    const comparisonData = {
      labels: ['Pos. 1-10', 'Pos. 11-20', 'Pos. 21-50', 'Pos. > 50', 'Non definite'],
      datasets: [
        {
          label: formatDateLabel(month1),
          data: [
            month1Data.pos1_10,
            month1Data.pos11_20, 
            month1Data.pos21_50,
            month1Data.pos_gt_50,
            month1Data.pos_undefined
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: formatDateLabel(month2),
          data: [
            month2Data.pos1_10,
            month2Data.pos11_20, 
            month2Data.pos21_50,
            month2Data.pos_gt_50,
            month2Data.pos_undefined
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
    
    setComparisonData(comparisonData);
    // Chiudi il modale di selezione e apri quello del confronto
    setOpenCompareModal(false);
    setOpenFullScreenModal(true);
  };

  return (
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
      
      {/* Selettore della data */}
      <FormControl variant="outlined" size="small" sx={{ minWidth: 200, mb: 2 }}>
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
      
      {/* Pulsante per aprire il modale di confronto */}
      <Button
        variant="outlined"
        size="small"
        onClick={openComparisonModal}
        sx={{ mb: 2, alignSelf: "flex-start" }}
        startIcon={<CompareArrowsIcon />}
      >
        Confronta mesi
      </Button>
      
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
          Confronto tra mesi
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
          <Typography variant="body1" sx={{ mb: 2 }}>
            Seleziona due mesi da confrontare:
          </Typography>
          
          <Grid container spacing={2}>
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
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeComparisonModal} color="primary">
            Annulla
          </Button>
          <Button onClick={compareSelectedMonths} color="primary" variant="contained">
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
          Confronto tra mesi
          <IconButton
            aria-label="close"
            onClick={() => setOpenFullScreenModal(false)}
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
        
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Confronto dati keyword
          </Typography>
          
          {/* Grafico a barre per il confronto */}
          <Box sx={{ width: "100%", height: "500px", mb: 2 }}>
            <Bar
              data={comparisonData}
              options={{
                indexAxis: 'y', // Questo rende il grafico orizzontale
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
                        if (context.parsed.x !== null) { // Cambiato da y a x per grafico orizzontale
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const value = context.parsed.x; // Cambiato da y a x per grafico orizzontale
                          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "0%";
                          label += `${value} (${percentage})`;
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
                      text: 'Numero di keywords'
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Posizione'
                    }
                  },
                },
                layout: {
                  padding: {
                    left: 10,
                    right: 30,
                    top: 0,
                    bottom: 0
                  }
                },
                barThickness: 30, // Controlla lo spessore delle barre
                maxBarThickness: 40
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpenFullScreenModal(false)} color="primary">
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default KeywordPositionChart;
