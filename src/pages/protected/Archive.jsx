import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Layout from "../../layout/Layout";
import ProjectGrid from "../../components/ProjectGrid/ProjectGrid";
import { DataGrid } from '@mui/x-data-grid';

const Archive  = () => {
  const projects = Array.from({ length: 12 }, (_, i) => ({
    name: `Project ${i + 1}`,
    domain: `example${i + 1}.com`,
    lastReport: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      .toLocaleDateString("it-IT"),
    keywords: Math.floor(Math.random() * 1000),
  }));

  const [dati, setDati] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("axo_token");

  console.log("Token utilizzato:", token); // Log del token per debug

  const loadDati = async () => {
    try {
      const url = `https://apit.axonasrl.com/api/axo_sel/${token}/progettiserp/progettiserpsel/leggiArchivio`;
      console.log("Calling API:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("API Raw response:", data);

      // Log dettagliato per vedere la struttura completa dell'oggetto
      if (data?.Itemset?.v_progettiserp?.length > 0) {
        console.log("Struttura primo progetto:", JSON.stringify(data.Itemset.v_progettiserp[0], null, 2));
      } else {
        console.log("No projects found in response");
      }

      // Formatta i dati ricevuti aggiungendo o mappando i campi richiesti
      const formattedData = (data?.Itemset?.v_progettiserp || []).map(item => ({
        ...item,
        ProgettiSerp_Nome: item.ProgettiSerp_Nome || item.nome || `Progetto ${item.IDOBJ || ''}`,
        ProgettiSerp_UltimoReport: item.ProgettiSerp_UltimoReport || item.dataKeyword || item.dataInserimento || new Date().toISOString(),
        domain: item.ProgettiSerp_DNS || item.domain || item.url || item.dominio || '',
        keywords: item.totaleKeyword || item.keywords || item.parole_chiave || 0
      }));

      console.log("Formatted data:", formattedData);
      setDati(formattedData);
    } catch (err) {
      console.error("Error loading progetti", err);
    }
  };

  const loadKeywords = async () => {
    try {
      const url = `https://apit.axonasrl.com/api/axo_sel/${token}/keywordserp/keywordserpsel/leggi`;
      console.log("Calling keywords API:", url);

      const response = await fetch(url);
      console.log("Keywords response status:", response.status);

      const data = await response.json();
      console.log("Keywords raw response:", data);

      setKeywords(data?.Itemset?.v_keywordserp || []);
    } catch (err) {
      console.error("Error loading keywords", err);
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  };

 /* const loadUrl = async () => {
    try {
      const response = await fetch(
        `https://apit.axonasrl.com/api/axo_sel/${token}/urlserp/urlserpsel/leggi`
      );
      const data = await response.json();
      setUrls(data?.Itemset?.v_urlserp || []);
    } catch (err) {
      console.error("Error loading URLs", err);
      setUrls([]);
    }
  };
*/
  useEffect(() => {
    loadDati();
    loadKeywords();
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'ProgettiSerp_Nome', headerName: 'Nome Progetto', width: 200 },
    { field: 'ProgettiSerp_Stato', headerName: 'Stato', width: 100 },
    { field: 'ProgettiSerp_DNS', headerName: 'Dominio', width: 200 },
    { field: 'ProgettiSerp_UltimoReport', headerName: 'Ultimo Report', width: 200 },
    { field: 'dataKeyword', headerName: 'Data Keyword', width: 200 },
    { field: 'totaleKeyword', headerName: 'Totale Keyword', width: 150 }
  ];
  
  // Aggiungo una chiave 'id' per ogni riga (necessaria per la DataGrid)
  const rows = dati.map((item, index) => ({
    id: index + 1,
    ...item
  }));

  if (loading) return null;

  return (
    <Layout>

        
        <DataGrid
        rows={rows}
        columns={columns}
       
      />


    
    </Layout>
  );
};

export default Archive;
