import React, { useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import Layout from "../../layout/Layout";
import { Select, MenuItem, TextField, Button } from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import useEnv from "../../hooks/useEnv";
import { Scrivi, Leggi } from "../../utility/callFetch";

const monthOptions = [
  "GENNAIO", "FEBBRAIO", "MARZO", "APRILE", "MAGGIO", "GIUGNO",
  "LUGLIO", "AGOSTO", "SETTEMBRE", "OTTOBRE", "NOVEMBRE", "DICEMBRE"
];
const yearOptions = [2025, 2026, 2027, 2028, 2029];
const monthYearOptions = [];
yearOptions.forEach(y => monthOptions.forEach(m => monthYearOptions.push(`${m} ${y}`)));


const formatDateToMonthYear = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return "";
  }
  try {
    
    const datePart = dateString.split('T')[0];
    // Split by '-' assuming YYYY-MM-DD format
    const parts = datePart.split('-');
    if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1; // Month is 1-based

        // Use the existing monthOptions array (assuming it's in scope)
        if (monthIndex >= 0 && monthIndex < monthOptions.length) {
            const monthName = monthOptions[monthIndex];
            return `${monthName} ${year}`;
        }
    }
    
    const existingFormatParts = dateString.split(' ');
     if (existingFormatParts.length === 2 && monthOptions.includes(existingFormatParts[0].toUpperCase())) {
         return dateString; // Assume already correct format
     }

    console.warn("Could not format date string:", dateString);
    return dateString; // Return original if format is unexpected
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // Return original on error
  }
};


const columns = [
  { field: 'name', headerName: 'Cliente', flex: 1, minWidth: 180 },
  {
    field: 'seo',
    headerName: 'SEO',
    type: 'boolean', // Explicitly define type
    flex: 1,
    minWidth: 120,
    editable: true,
    align: 'left', // Add left alignment for cell content
    headerAlign: 'left', // Add left alignment for header
    renderCell: (params) => params.value === true ? 'SI' : 'NO', // Use renderCell for display
    renderEditCell: (params) => (
      <Select
        // Ensure value is always boolean for the Select
        value={params.value === true ? true : false}
        size="small"
        onChange={e => params.api.setEditCellValue({ id: params.id, field: 'seo', value: e.target.value }, e)}
        sx={{ minWidth: 80 }}
        autoFocus
      >
        <MenuItem value={true}>SI</MenuItem>
        <MenuItem value={false}>NO</MenuItem>
      </Select>
    ),
    sortable: false
  },
  {
    field: 'multilanding',
    headerName: 'MULTILANDING',
    type: 'boolean', // Explicitly define type
    flex: 1,
    minWidth: 120,
    editable: true,
    align: 'left', // Add left alignment for cell content
    headerAlign: 'left', // Add left alignment for header
    renderCell: (params) => params.value === true ? 'SI' : 'NO', // Use renderCell for display
    renderEditCell: (params) => (
      <Select
        // Ensure value is always boolean for the Select
        value={params.value === true ? true : false}
        size="small"
        onChange={e => params.api.setEditCellValue({ id: params.id, field: 'multilanding', value: e.target.value }, e)}
        sx={{ minWidth: 80 }}
        autoFocus
      >
        <MenuItem value={true}>SI</MenuItem>
        <MenuItem value={false}>NO</MenuItem>
      </Select>
    ),
    sortable: false
  },
  {
    field: 'news',
    headerName: 'NEWS',
    flex: 1,
    minWidth: 120,
    editable: true,
    renderEditCell: (params) => (
      <TextField
        value={params.value || ''}
        size="small"
        variant="standard"
        onChange={e => params.api.setEditCellValue({ id: params.id, field: 'news', value: e.target.value }, e)}
        sx={{ minWidth: 80 }}
        autoFocus
      />
    ),
    sortable: false
  },
  {
    field: 'inizioContratto',
    headerName: 'INIZIO CONTRATTO',
    flex: 1,
    minWidth: 200,
    editable: true,
    // Add renderCell to ensure correct display format
    renderCell: (params) => formatDateToMonthYear(params.value),
    renderEditCell: (params) => {
      // The edit cell logic seems fine, it works with "MESE ANNO"
      let value = params.value || '';
      // Ensure the value used for splitting is the formatted one if needed,
      // but usually params.value should be correct from the state here.
      let [mese, anno] = formatDateToMonthYear(value).split(' ');
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Select
            value={mese || ''}
            size="small"
            onChange={e => {
              const newValue = `${e.target.value} ${anno || ''}`.trim();
              params.api.setEditCellValue({ id: params.id, field: 'inizioContratto', value: newValue }, e);
            }}
            sx={{ minWidth: 100 }}
            autoFocus
          >
            <MenuItem value=""></MenuItem>
            {monthOptions.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <Select
            value={anno || ''}
            size="small"
            onChange={e => {
              const newValue = `${mese || ''} ${e.target.value}`.trim();
              params.api.setEditCellValue({ id: params.id, field: 'inizioContratto', value: newValue }, e);
            }}
            sx={{ minWidth: 80 }}
          >
            <MenuItem value=""></MenuItem>
            {yearOptions.map(opt => (
              <MenuItem key={opt} value={String(opt)}>{opt}</MenuItem>
            ))}\
          </Select>
        </div>
      );
    },
    sortable: false
  },
];

function exportToCSV(clients) {
  const headers = ["Cliente", "SEO", "MULTILANDING", "NEWS", "INIZIO CONTRATTO"];
  // Map boolean values to SI/NO for export
  const rows = clients.map(c => [
    c.name,
    c.seo === true ? 'SI' : 'NO',
    c.multilanding === true ? 'SI' : 'NO',
    c.news,
    c.inizioContratto
  ]);
  let csvContent = headers.join(";") + "\n" + rows.map(r => r.join(";")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "clienti_prodotti.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const ClientProductsArchive = () => {
  const { SERVERAPI, AZIENDA } = useEnv();
  const token = localStorage.getItem("axo_token");
  const [clients, setClients] = useState([]);

  // Moved loadClients outside useEffect
  const loadClients = async () => {
    try {
      // 1. Leggi i progetti
      const DB = "progettiserp";
      const progettiResponse = await Leggi(
        SERVERAPI,
        token,
        DB,
        `WHERE AZIENDA = '${AZIENDA}'`
      );

      // 2. Leggi tutti i prodotti (SEO/MULTILANDING) associati ai progetti
      const prodottiResponse = await Leggi(
        SERVERAPI,
        token,
        "ProgettiSerpProdotti",
        `WHERE AZIENDA = '${AZIENDA}'`
      );

      // 3. Prepara una mappa per accesso rapido ai prodotti per progetto e articolo
      const prodottiMap = {};
      if (prodottiResponse?.Itemset?.ProgettiSerpProdotti) {
        prodottiResponse.Itemset.ProgettiSerpProdotti.forEach(prod => {
          if (!prodottiMap[prod.PIDOBJ]) prodottiMap[prod.PIDOBJ] = {};
          prodottiMap[prod.PIDOBJ][prod.ProgettiSerpProdotti_Articolo] = prod;
        });
      }

      if (progettiResponse?.Itemset?.progettiserp) {
        const clienti = progettiResponse.Itemset.progettiserp.map(item => {
          const seoProd = prodottiMap[item.IDOBJ]?.[1];
          const multilandingProd = prodottiMap[item.IDOBJ]?.[2];
          return {
            id: item.IDOBJ,
            name: item.ProgettiSerp_Nome || item.nome || `Progetto ${item.IDOBJ}`,
            // Map to boolean true/false
            seo: seoProd ? (seoProd.ProgettiSerpProdotti_Valore === true || String(seoProd.ProgettiSerpProdotti_Valore).toUpperCase() === "SI" || String(seoProd.ProgettiSerpProdotti_Valore) === "1") : false,
            idseo: seoProd ? seoProd.IDOBJ : undefined,
            // Map to boolean true/false
            multilanding: multilandingProd ? (multilandingProd.ProgettiSerpProdotti_Valore === true || String(multilandingProd.ProgettiSerpProdotti_Valore).toUpperCase() === "SI" || String(multilandingProd.ProgettiSerpProdotti_Valore) === "1") : false,
            idmultilanding: multilandingProd ? multilandingProd.IDOBJ : undefined,
            news: item.ProgettiSerp_News || "",
            // Format the date here before setting state
            inizioContratto: formatDateToMonthYear(item.ProgettiSerp_InizioContratto || ""),
          };
        });
        setClients(clienti);
      } else {
        setClients([]);
      }
    } catch (e) {
      console.error('Error loading clients:', e);
      setClients([]);
    }
  };

  useEffect(() => {
    loadClients();
  }, [SERVERAPI, token, AZIENDA]); 

  const saveClientField = async (projectId, field, value, recordId) => {
    let newRecordId = null; // Variable to store the new ID if created
    try {
      if (field === "seo" || field === "multilanding") {
        const DB = "ProgettiSerpProdotti";
        const Classe = "ProgettiSerpProdotti";
        const articolo = field === "seo" ? 1 : 2;

        // Leggi per trovare l'IDOBJ se non fornito o se è 0 (per nuovi record)
        let existingRecordId = recordId;
        if (!existingRecordId) {
            const leggiResponse = await Leggi(
              SERVERAPI,
              token,
              DB,
              `WHERE AZIENDA = '${AZIENDA}' AND PIDOBJ = '${projectId}' AND ProgettiSerpProdotti_Articolo = ${articolo}`
            );
            console.log(`Leggi response for ${field} check:`, leggiResponse);
            if (leggiResponse?.Itemset?.ProgettiSerpProdotti?.[0]?.IDOBJ) {
                existingRecordId = leggiResponse.Itemset.ProgettiSerpProdotti[0].IDOBJ;
                console.log(`Found existing record ID for ${field}: ${existingRecordId}`);
            }
        }


        const jsonObj = {
          ProgettiSerpProdotti_Articolo: articolo,
          // Ensure boolean value is sent correctly if needed by backend, otherwise adjust
          ProgettiSerpProdotti_Valore: value,
          AZIENDA,
          PIDOBJ: projectId
        };

        const idobj = existingRecordId || 0;

        console.log(`Saving ${field} - IDOBJ: ${idobj}, Payload:`, jsonObj);
        const scrittoResponse = await Scrivi(SERVERAPI, token, idobj, DB, Classe, jsonObj);
        console.log('Scrivi Response:', scrittoResponse);

        // If a new record was created, capture the new IDOBJ
        if (idobj === 0 && scrittoResponse?.Itemset?.[Classe]?.[0]?.IDOBJ) {
            newRecordId = scrittoResponse.Itemset[Classe][0].IDOBJ;
            console.log(`New record created for ${field}, IDOBJ: ${newRecordId}`);
            // No state update here, return the ID instead
        }

      } else if (field === "news" || field === "inizioContratto") {
        // Salva su progettiserp
        const DB = "progettiserp";
        const Classe = "progettiserpsel";
        const fieldMap = {
          news: "ProgettiSerp_News",
          inizioContratto: "ProgettiSerp_InizioContratto"
        };
        const backendField = fieldMap[field];
        const jsonObj = {
          IDOBJ: projectId,
          [backendField]: value,
          AZIENDA
        };
        console.log(`Attempting to save ${field}:`, {
          projectId,
          field,
          value,
          backendField,
          jsonObj
        });

     
        const scrittoResponse = await Scrivi(SERVERAPI, token, projectId, DB, Classe, jsonObj);
        console.log('Scrivi Response:', scrittoResponse);

       
      }
    } catch (e) {
      console.error(`Error saving field ${field}:`, e);
      throw e;
    }
    // Return the new ID if one was created
    return newRecordId;
  };

  const processRowUpdate = async (newRow, oldRow) => {
    let updatedRowData = { ...newRow }; // Start with the grid's proposed new row

    try {
      console.log('Processing row update:', { oldRow, newRow });

      // Check which fields changed and save them, collecting potential new IDs
      const promises = [];
      const idUpdates = {}; // Object to store potential new IDs { idseo: ..., idmultilanding: ... }

      if (newRow.seo !== oldRow.seo) {
        promises.push(
          saveClientField(newRow.id, "seo", newRow.seo, newRow.idseo)
            .then(newId => { if (newId) idUpdates.idseo = newId; }) // Store new ID if returned
        );
      }
      if (newRow.multilanding !== oldRow.multilanding) {
        promises.push(
          saveClientField(newRow.id, "multilanding", newRow.multilanding, newRow.idmultilanding)
            .then(newId => { if (newId) idUpdates.idmultilanding = newId; }) // Store new ID if returned
        );
      }
      if (newRow.news !== oldRow.news) {
        promises.push(saveClientField(newRow.id, "news", newRow.news)); // No ID expected back
      }
      if (newRow.inizioContratto !== oldRow.inizioContratto) {
        promises.push(saveClientField(newRow.id, "inizioContratto", newRow.inizioContratto)); // No ID expected back
      }

      // Wait for all save operations to complete
      await Promise.all(promises);

      // Merge any new IDs into the row data *before* updating state
      updatedRowData = { ...updatedRowData, ...idUpdates };

      // Update local state *after* successful save and ID merge using functional update
      setClients(prevClients =>
        prevClients.map(client =>
          client.id === updatedRowData.id ? updatedRowData : client // Directly use updatedRowData
        )
      );

      // Return the final updated row data (captured from the state update) to the grid
      console.log('Row update successful, returning:', updatedRowData); // Log the data being returned
      return updatedRowData; // Return the data that reflects the successful save

    } catch (e) {
      console.error('Error in processRowUpdate:', e);
   
      return oldRow; // Return oldRow to revert changes in the DataGrid
    }
  };

  return (
    <Layout label="Client product" showSearchBar={false}>
      <div style={{ padding: 24 }}>
        <Button
          variant="contained"
          startIcon={<DownloadOutlinedIcon />}
          onClick={() => exportToCSV(clients)}
          sx={{ marginBottom: 2 }}
        >
          Esporta in Excel (CSV)
        </Button>
        <div style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
          <DataGrid
            rows={clients}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 100 }, // Default page size is 100
              },
            }}
            pageSizeOptions={[100]} // Only allow 100 as page size option
            disableSelectionOnClick
            autoHeight
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={(error) => console.error('DataGrid ProcessRowUpdate Error:', error)}
            sx={{ backgroundColor: '#fff' }}
            editMode="row"
          />
        </div>
      </div>
    </Layout>
  );
};

export default ClientProductsArchive;
