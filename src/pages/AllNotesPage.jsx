import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import useEnv from "../hooks/useEnv";
import { Leggi } from "../utility/callFetch";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import Layout from "../layout/Layout";

const AllNotesPage = ({ token }) => {
  const { SERVERAPI, AZIENDA } = useEnv();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllNotes = async () => {
      setLoading(true);
      try {
        const filtro = `WHERE AZIENDA = '${AZIENDA}'`;
        const response = await Leggi(
          SERVERAPI,
          token,
          "SEO_NoteProgetti",
          filtro
        );
        console.log("DEBUG NOTE RESPONSE", response);
        setNotes(response?.Itemset?.SEO_NoteProgetti || []);
      } catch (e) {
        setNotes([]);
      }
      setLoading(false);
    };
    fetchAllNotes();
  }, [SERVERAPI, token, AZIENDA]);

  const columns = [
 
    { field: 'S_INSTS', headerName: 'Data', width: 180,
        renderCell: (params) => {
        if (!params || !params.row) return '-';
        if (params.row.S_INSTS)
          return new Date(params.row.S_INSTS).toLocaleString('it-IT');
        if (params.row.S_INSTS)
          return new Date(params.row.S_INSTS).toLocaleString('it-IT');
        return '-';
      }
    },

    { field: 'ProgettiSerp_Nome', headerName: 'Progetto', width: 250 },
    { field: 'ProgettiSerpNote_Nome', headerName: 'Utente', width: 180 },
    {
      field: 'ProgettiSerpNote_Nota',
      headerName: 'Nota',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <div style={{
          whiteSpace: 'pre-line',
          wordBreak: 'break-word',
          maxHeight: 80,
          overflow: 'auto',
          lineHeight: 1.4,
          fontSize: 15,
          padding: 4,
          width: '100%'
        }}>{params.value}</div>
      )
    },
   
  ];

  return (
    <>

      <Layout label = "All notes" 
      showSearchBar = {false}>
        
    
      <Box>
       
        <Paper style={{ height: '90vh' , width: '100%' }}>
          <DataGrid
            rows={notes.map((note, idx) => ({ id: idx, ...note }))}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            loading={loading}
          />
        </Paper>
      </Box>  </Layout>
    </>
  );
};

export default AllNotesPage;
