import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Layout from "../layout/Layout";
import ProjectGrid from "../components/ProjectGrid/ProjectGrid";
import SearchBar from "../components/SearchBar";
import useEnv from "../hooks/useEnv"; // Assicurati di avere questo hook per l'uso dell'ambiente

const Homepage = ({ onLoadStart, onLoadComplete }) => {
  const projects = Array.from({ length: 12 }, (_, i) => ({
    name: `Project ${i + 1}`,
    domain: `example${i + 1}.com`,
    lastReport: new Date(
      Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
    ).toLocaleDateString("it-IT"),
    keywords: Math.floor(Math.random() * 1000),
  }));

  const [dati, setDati] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Stato per il termine di ricerca

  const token = localStorage.getItem("axo_token");

  console.log("Token utilizzato:", token); // Log del token per debug

  const { SERVERAPI } = useEnv(); // Assicurati di importare useEnv correttamente

  const loadDati = async () => {
    try {
      const url = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggi`;
      console.log("Calling API:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("API Raw response:", data);

      // Log dettagliato per vedere la struttura completa dell'oggetto
      if (data?.Itemset?.v_progettiserp?.length > 0) {
        console.log(
          "Struttura primo progetto:",
          JSON.stringify(data.Itemset.v_progettiserp[0], null, 2)
        );
      } else {
        console.log("No projects found in response");
      }

      // Formatta i dati ricevuti aggiungendo o mappando i campi richiesti

      const sortList = data?.Itemset?.v_progettiserp.sort((a, b) => {
        return a.ProgettiSerp_Nome?.localeCompare(b.ProgettiSerp_Nome);
      });

      const formattedData = (sortList || []).map((item) => ({
        ...item,
        ProgettiSerp_Nome:
          item.ProgettiSerp_Nome || item.nome || `Progetto ${item.IDOBJ || ""}`,
        // Prioritize dataKeyword, then dataEstrazione, then ProgettiSerp_UltimoReport, then dataInserimento
        ProgettiSerp_UltimoReport:
          item.dataKeyword ||
          item.dataEstrazione ||
          item.ProgettiSerp_UltimoReport ||
          item.dataInserimento ||
          new Date().toISOString(),
        domain:
          item.ProgettiSerp_DNS ||
          item.domain ||
          item.url ||
          item.dominio ||
          "",
        keywords:
          item.totaleKeyword || item.keywords || item.parole_chiave || 0,
      }));

      console.log("Formatted data:", formattedData);
      setDati(formattedData);
    } catch (err) {
      console.error("Error loading progetti", err);
    }
  };

  const loadKeywords = async () => {
    try {
      const url = `${SERVERAPI}/api/axo_sel/${token}/keywordserp/keywordserpsel/leggi`;
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

  useEffect(() => {
    onLoadStart?.();
    const loadAllData = async () => {
      try {
        await Promise.all([loadDati(), loadKeywords()]);
      } finally {
        onLoadComplete?.();
      }
    };
    loadAllData();
  }, []);

  // Funzione per gestire l'aggiornamento del termine di ricerca
  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase()); // Converti in minuscolo per ricerca case-insensitive
  };

  // Handler for when a new project is added
  const handleProjectAdded = () => {
    // Reload data when a new project is added
    loadDati();
  };

  // Filtra i progetti in base al termine di ricerca
  const filteredProjects = dati.filter(
    (project) =>
      (project.ProgettiSerp_Nome || "").toLowerCase().includes(searchTerm) ||
      (project.ProgettiSerp_DNS || "").toLowerCase().includes(searchTerm)
  );

  if (loading) return null;

  return (
    <Layout
      onProjectAdded={handleProjectAdded}
      showSearchBar={true}
      onSearch={handleSearch}
    >
      <Box sx={{ pl: 2, pr: 3 }}>
        <ProjectGrid
          projects={filteredProjects}
          onProjectUpdate={() => {
            loadDati(); // Ricarica i dati dopo l'aggiornamento di un progetto
          }}
        />
        <Typography sx={{ mt: 2 }} variant="body2">
          Keywords caricate: {keywords.length}
        </Typography>
        <Typography sx={{ mt: 1 }} variant="body2">
          URLs caricati: {dati.length}
        </Typography>
      </Box>
    </Layout>
  );
};

export default Homepage;
