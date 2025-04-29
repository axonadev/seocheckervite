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

const columns = [
  { field: 'name', headerName: 'Cliente', flex: 1, minWidth: 180 },
  {
    field: 'seo',
    headerName: 'SEO',
    flex: 1,
    minWidth: 120,
    editable: true,
    renderEditCell: (params) => (
      <Select
        value={params.value || 'NO'}
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
    flex: 1,
    minWidth: 120,
    editable: true,
    renderEditCell: (params) => (
      <Select
        value={params.value || 'NO'}
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
    renderEditCell: (params) => {
      let value = params.value || '';
      let [mese, anno] = value.split(' ');
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
            ))}
          </Select>
        </div>
      );
    },
    sortable: false
  },
];

function exportToCSV(clients) {
  const headers = ["Cliente", "SEO", "MULTILANDING", "NEWS", "INIZIO CONTRATTO"];
  const rows = clients.map(c => [c.name, c.seo, c.multilanding, c.news, c.inizioContratto]);
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

  useEffect(() => {
    const loadClients = async () => {
      try {

        const DB = "Seo_ProgettiArticoli";



        // Prima controlla se esiste già un record
        const leggiResponse = await Leggi(
          SERVERAPI,
          token,
          DB,
          `WHERE AZIENDA = '${AZIENDA}' `
        );


        const data = await leggiResponse


        console.log('Leggi response:', data);
        const clienti = (data?.Itemset?.Seo_ProgettiArticoli || []).map(item => ({
          id: item.IDOBJ,
          name: item.ProgettiSerp_Nome || item.nome || `Progetto ${item.IDOBJ}`,
          seo: item.Seo? "SI":"NO" || "NO",
          idseo: item.IDSeo,
          multilanding: item.MULTILANDING? "SI":"NO" || "NO",
          idmultilanding: item.IDMULTILANDING,
          news: item.ProgettiSerp_News || "",
          inizioContratto: item.ProgettiSerp_InizioContratto || "",
        }));
        setClients(clienti);
      } catch (e) {
        console.error('Error loading clients:', e);
        setClients([]);
      }
    };
    loadClients();
  }, [SERVERAPI, token]);

  const saveClientField = async (projectId, field, value, recordId) => {
    try {
      if (field === "seo" || field === "multilanding") {
        const DB = "ProgettiSerpProdotti";
        const Classe = "ProgettiSerpProdotti";
        const articolo = field === "seo" ? 1 : 2;

        // Prima controlla se esiste già un record
        const leggiResponse = await Leggi(
          SERVERAPI,
          token,
          DB,
          `WHERE AZIENDA = '${AZIENDA}' AND PIDOBJ = '${projectId}' AND ProgettiSerpProdotti_Articolo = ${articolo}`
        );
        console.log('Leggi response:', leggiResponse);

        const jsonObj = {
          ProgettiSerpProdotti_Articolo: articolo,
          ProgettiSerpProdotti_Valore: value,
          AZIENDA,
          PIDOBJ: projectId  // Aggiungiamo PIDOBJ al payload
        };

        const idobj = recordId || 0;  // Usa 0 per nuovo record, altrimenti usa recordId esistente

        console.log(`Saving ${field} - IDOBJ: ${idobj}, Payload:`, jsonObj);
        const scrittoResponse = await Scrivi(SERVERAPI, token, idobj, DB, Classe, jsonObj);
        console.log('Scrivi Response:', scrittoResponse);

        // Ricarica i dati dopo il salvataggio
        const reloadResponse = await Leggi(
          SERVERAPI,
          token,
          DB,
          `WHERE AZIENDA = '${AZIENDA}' AND PIDOBJ = '${projectId}' AND ProgettiSerpProdotti_Articolo = ${articolo}`
        );
        console.log('Reload response:', reloadResponse);
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

        // Prima leggiamo il record esistente
        const leggiResponse = await Leggi(
          SERVERAPI,
          token,
          DB,
          `WHERE AZIENDA = '${AZIENDA}' AND IDOBJ = '${projectId}'`
        );
        console.log('Leggi response for project:', leggiResponse);

        // Salviamo il record
        const scrittoResponse = await Scrivi(SERVERAPI, token, projectId, DB, Classe, jsonObj);
        console.log('Scrivi Response:', scrittoResponse);

        // Verifichiamo il salvataggio
        const verifyResponse = await Leggi(
          SERVERAPI,
          token,
          DB,
          `WHERE AZIENDA = '${AZIENDA}' AND IDOBJ = '${projectId}'`
        );
        console.log('Verify after save:', verifyResponse);
      }
    } catch (e) {
      console.error(`Error saving field ${field}:`, e);
      throw e; // Rilanciamo l'errore per gestirlo nel processRowUpdate
    }
  };

  const processRowUpdate = async (newRow, oldRow) => {
    try {
      console.log('Processing row update:', {
        oldRow,
        newRow,
        changes: {
          seoChanged: newRow.seo !== oldRow.seo,
          multilandingChanged: newRow.multilanding !== oldRow.multilanding,
          newsChanged: newRow.news !== oldRow.news,
          inizioContrattoChanged: newRow.inizioContratto !== oldRow.inizioContratto
        }
      });

      const updatedClients = clients.map(c => c.id === newRow.id ? { ...c, ...newRow } : c);
      setClients(updatedClients);
      
      if (newRow.seo !== oldRow.seo) {
        await saveClientField(newRow.id, "seo", newRow.seo, newRow.idseo);
      }
      if (newRow.multilanding !== oldRow.multilanding) {
        await saveClientField(newRow.id, "multilanding", newRow.multilanding, newRow.idmultilanding);
      }
      if (newRow.news !== oldRow.news) {
        console.log('Saving news change:', {
          id: newRow.id,
          oldNews: oldRow.news,
          newNews: newRow.news
        });
        await saveClientField(newRow.id, "news", newRow.news);
      }
      if (newRow.inizioContratto !== oldRow.inizioContratto) {
        console.log('Saving inizioContratto change:', {
          id: newRow.id,
          oldInizioContratto: oldRow.inizioContratto,
          newInizioContratto: newRow.inizioContratto
        });
        await saveClientField(newRow.id, "inizioContratto", newRow.inizioContratto);
      }
      
      return newRow;
    } catch (e) {
      console.error('Error in processRowUpdate:', e);
      throw e;
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
            pageSize={20}
            rowsPerPageOptions={[20]}
            disableSelectionOnClick
            autoHeight
            processRowUpdate={processRowUpdate}
            sx={{ backgroundColor: '#fff' }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ClientProductsArchive;
