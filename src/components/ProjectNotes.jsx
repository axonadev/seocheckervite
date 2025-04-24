import React, { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { Add as AddIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import useEnv from "../hooks/useEnv";
import { Scrivi, Leggi } from "../utility/callFetch"; // Assuming Scrivi handles updates

const ProjectNotes = ({ projectId, token }) => {

  const nomeLocale = localStorage.getItem("axo_nomeLocale") || "";

  const { SERVERAPI } = useEnv();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNoteName, setNewNoteName] = useState(nomeLocale);
  const [newNoteText, setNewNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);


  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await Leggi (
        SERVERAPI,
        token,
        "ProgettiSerpNote",
        `WHERE AZIENDA = '{AZIENDA}' AND PIDOBJ = '${projectId}'`,
      )
     console.log (response)

      if (response && response.Itemset.ProgettiSerpNote) {
        setNotes(response.Itemset.ProgettiSerpNote);
      } else {
        setNotes([]);
      }
    } catch (e) {
      setNotes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!projectId) return;
   
    fetchNotes();
  }, [projectId, token, SERVERAPI]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteName.trim() || !newNoteText.trim()) return;
    setSubmitting(true);
    try {

        const response  = await Scrivi (
        SERVERAPI,
        token,
        0,
        "ProgettiSerpNote",
        "ProgettiSerpNote",
        {
          progettiserpnote_nome: newNoteName,
          progettiserpnote_nota: newNoteText,
 
          pidobj: projectId
        }
      );
    
      localStorage.setItem("axo_nomeLocale", newNoteName);

        setNewNoteName(newNoteName);
        setNewNoteText("");
        // Ricarica le note

        setNotes((prec)=> [...prec, {
          ProgettiSerpNote_Nome: newNoteName,
          ProgettiSerpNote_Nota: newNoteText,
          ProgettiSerpNote_Data: new Date().toISOString(),
        }]);
       
     
    } catch (e) {}
    setSubmitting(false);
  };

  // Ordina le note dalla più recente alla più vecchia
  const sortedNotes = [...notes].reverse();

  if (loading) return <Typography variant="body2">Caricamento note...</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        sx={{ mb: 1 }}
        onClick={() => setShowAddForm(v => !v)}
      >
        Aggiungi nota
      </Button>
      {showAddForm && (
        <Box component="form" onSubmit={handleAddNote} sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <input
            type="text"
            placeholder="Nome"
            value={newNoteName}
            onChange={e => setNewNoteName(e.target.value)}
            disabled={submitting}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <textarea
            placeholder="Testo della nota"
            value={newNoteText}
            onChange={e => setNewNoteText(e.target.value)}
            disabled={submitting}
            rows={3}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button type="submit" disabled={submitting || !newNoteName.trim() || !newNoteText.trim()} style={{ alignSelf: 'flex-end', padding: '6px 16px', borderRadius: 4, border: 'none', background: '#1976d2', color: '#fff', cursor: 'pointer' }}>
            {submitting ? 'Salvataggio...' : 'Aggiungi nota'}
          </button>
        </Box>
      )}
      <List dense sx={{ maxHeight: 150, overflowY: 'auto' }}>
        {sortedNotes.map((note, idx) => {
          let dataStr = '';
          if (note.S_INSTS) {
            const d = new Date(note.S_INSTS);
            dataStr = d.toLocaleString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
          }
          return (
            <ListItem key={idx} disablePadding>
              <ListItemText
                primary={<span style={{ color: '#222', fontWeight: 500 }}>{note.ProgettiSerpNote_Nota}</span>}
                secondary={
                  <span style={{ color: '#666', fontSize: '0.95em' }}>
                    {note.ProgettiSerpNote_Nome}
                    {dataStr && <span style={{ color: '#888', fontSize: '0.85em', marginLeft: 12 }}>({dataStr})</span>}
                  </span>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default ProjectNotes;
