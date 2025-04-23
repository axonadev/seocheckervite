import React from "react";
import { Popover, Box, Typography, Button } from "@mui/material";
import { FormatDate } from "../utility/FormatDate";

const ExportDatePopover = ({
  id,
  open,
  anchorEl,
  onClose,
  uniqueExtractionDates,
  onExportCsvWithDate,
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
        sx: { width: 200, p: 1, borderRadius: 1 },
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ p: 1, fontWeight: "bold", textAlign: "center" }}
      >
        Seleziona la data di estrazione (CSV)
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          mt: 1,
          maxHeight: 200,
          overflowY: "auto",
        }}
      >
        {uniqueExtractionDates.length > 0 ? (
          uniqueExtractionDates.map((dateStr) => (
            <Button
              key={dateStr}
              variant="text"
              onClick={() => onExportCsvWithDate(dateStr)}
              sx={{ justifyContent: "flex-start", py: 1 }}
            >
              {FormatDate(new Date(dateStr), "dd-MM-yyyy")}
            </Button>
          ))
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", p: 1 }}
          >
            Nessuna data disponibile.
          </Typography>
        )}
      </Box>
    </Popover>
  );
};

export default ExportDatePopover;
