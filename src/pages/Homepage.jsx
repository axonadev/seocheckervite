import React, {useEffect, useState} from "react";
import { Box } from "@mui/material";
import Layout from "../layout/Layout";
import ProjectGrid from "../components/ProjectGrid/ProjectGrid";

const Homepage = () => {
  const projects = Array.from({ length: 12 }, (_, i) => ({
    name: `Project ${i + 1}`,
    domain: `example${i + 1}.com`,
    lastReport: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('it-IT'),
    keywords: Math.floor(Math.random() * 1000)
  }));

  const [dati, setDati] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("axo_token");

  const loadDati = async () => {
    const response = await fetch('https://apit.axonasrl.com/api/axo_sel/'+token+'/progettiserp/progettiserpsel/leggi'); // Replace with your API endpoint
    const data = await response.json();
    setDati(data.Itemset.v_progettiserp);
  }

  useEffect(() => {
    loadDati();
  }, []);


  console.log(dati, "dati");  
  return (
    <Layout>
      <Box sx={{ pl: '-100x', pr: 3 }}>
        <ProjectGrid projects={dati} />
      </Box>
    </Layout>
  );
};

export default Homepage;
