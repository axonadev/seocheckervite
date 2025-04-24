import React, { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import useEnv from "../hooks/useEnv";
import { Scrivi, Leggi } from "../utility/callFetch"; // Assuming Scrivi handles updates

const ProjectNotes = ({ projectId, token }) => {
  const { SERVERAPI } = useEnv();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNoteName, setNewNoteName] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const response = await Leggi (
          SERVERAPI,
          token,
          "ProgettiSerpNote","WHERE AZIENDA = '{AZIENDA}'",
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
    
      const data = await response.json();
      if (data && data.Esito === 1) {
        setNewNoteName("");
        setNewNoteText("");
        // Ricarica le note
        if (typeof fetchNotes === 'function') fetchNotes();
        else window.location.reload(); // fallback
      }
    } catch (e) {}
    setSubmitting(false);
  };

  if (loading) return <Typography variant="body2">Caricamento note...</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>Note progetto</Typography>
      <Box component="form" onSubmit={handleAddNote} sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <input
          type="text"
          placeholder="Titolo nota"
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
      {notes.length === 0 ? (
        <Typography variant="body2">Nessuna nota presente.</Typography>
      ) : (
        <List dense>
          {notes.map((note, idx) => (
            <ListItem key={idx} disablePadding>
              <ListItemText
                primary={note.ProgettiSerpNote_Nome}
                secondary={note.ProgettiSerpNote_Nota}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ProjectNotes;
