import React, { useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import Layout from "../../layout/Layout";
import { Select, MenuItem, TextField } from '@mui/material';
import useEnv from "../../hooks/useEnv";
import { Scrivi } from "../../utility/callFetch";

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
        <MenuItem value="SI">SI</MenuItem>
        <MenuItem value="NO">NO</MenuItem>
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
        <MenuItem value="SI">SI</MenuItem>
        <MenuItem value="NO">NO</MenuItem>
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
  const { SERVERAPI } = useEnv();
  const token = localStorage.getItem("axo_token");
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const url = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggi`;
        const response = await fetch(url);
        const data = await response.json();
        const clienti = (data?.Itemset?.v_progettiserp || []).map(item => ({
          id: item.IDOBJ,
          name: item.ProgettiSerp_Nome || item.nome || `Progetto ${item.IDOBJ}`,
          seo: "NO",
          multilanding: "NO",
          news: "",
          inizioContratto: "",
        }));
        setClients(clienti);
      } catch (e) {
        setClients([]);
      }
    };
    loadClients();
  }, [SERVERAPI, token]);

  // Funzione per salvare le modifiche usando la funzione Scrivi
  const saveClientField = async (id, field, value) => {
    try {
      const DB = "progettiserp";
      const Classe = "progettiserpsel";
      // Mappa i campi della tabella ai nomi delle variabili del backend
      const fieldMap = {
        seo: "progettiserp_seo",
        multilanding: "progettiserp_multilanding",
        news: "progettiserp_news",
        inizioContratto: "progettiserp_iniziocontratto"
      };
      const backendField = fieldMap[field] || field;
      const jsonObj = { IDOBJ: id, [backendField]: value };
      await Scrivi(SERVERAPI, token, id, DB, Classe, jsonObj);
    } catch (e) {
      // Gestione errore silenziosa, puoi aggiungere notifiche se necessario
    }
  };

  // Aggiorna lo stato clients in tempo reale quando una riga viene modificata
  const processRowUpdate = async (newRow, oldRow) => {
    const updatedClients = clients.map(c => c.id === newRow.id ? { ...c, ...newRow } : c);
    setClients(updatedClients);
    // Salva solo i campi modificati
    for (const key of Object.keys(newRow)) {
      if (newRow[key] !== oldRow[key] && ["seo", "multilanding", "news", "inizioContratto"].includes(key)) {
        await saveClientField(newRow.id, key, newRow[key]);
      }
    }
    return newRow;
  };

  return (
    <Layout label="Archivio Prodotti Clienti" showSearchBar={false}>
      <div style={{ padding: 24 }}>
        <button onClick={() => exportToCSV(clients)} style={{ marginBottom: 16 }}>Esporta in Excel (CSV)</button>
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
