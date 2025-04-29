import React from "react";
import {
  Popover,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const AddKeywordPopover = ({
  id,
  open,
  anchorEl,
  onClose,
  keywords,
  onAddKeyword,
  onDeleteKeyword,
  newKeywordInput,
  onNewKeywordInputChange,
}) => {
  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: { width: 400, borderRadius: 2 },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              mr: 1,
              p: "4px",
            }}
          >
            <AddCircleOutlineIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6">Nuova Key</Typography>
        </Box>
        <TextField
          label="Keyword (una per riga)" // Updated label
          variant="filled"
          size="small"
          fullWidth
          multiline // Added multiline prop
          rows={4} // Added rows prop for initial height
          value={newKeywordInput}
          onChange={onNewKeywordInputChange}
          // Removed onKeyPress handler to allow Enter for new lines
          sx={{ mb: 1, backgroundColor: "rgba(0, 0, 0, 0.06)" }}
          InputProps={{ disableUnderline: true }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1 }}
        >
          Keywords inserite nel progetto
        </Typography>
        <Box
          sx={{
            height: 200,
            overflowY: "auto",
            mb: 2,
            border: "1px solid #eee",
            borderRadius: 1,
            p: 1,
            bgcolor: "#fff",
          }}
        >
          {keywords.length > 0 ? (
            keywords.map((kw) => (
              <Box
                key={kw.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 0.5,
                  borderBottom: "1px solid #f5f5f5",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    flexGrow: 1,
                    mr: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {kw.KeywordSerp_Keyword}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onDeleteKeyword(kw.id)}
                  aria-label="delete keyword"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 2 }}
            >
              Nessuna keyword presente.
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={onAddKeyword}
            size="small"
            startIcon={<AddIcon />}
            sx={{ borderRadius: "16px" }}
          >
            Aggiungi
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default AddKeywordPopover;
