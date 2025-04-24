import React, { useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditProjectPopup from "./EditProjectPopup";
import { FormatDate } from "../utility/FormatDate";

const ProjectDetailHeader = ({
  project,
  projectLogo,
  onLogoChange,
  onOpenEditProject,
  editProjectAnchorEl,
  onCloseEditProject,
  onProjectUpdated,
  editProjectPopoverId,
}) => {
  const fileInputRef = useRef(null);

  const handleLogoButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Grid container spacing={2} sx={{ mb: 3, alignItems: "flex-start" }}>
      <Grid item xs={12} md={4}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
          }}
          onClick={onOpenEditProject}
          aria-describedby={editProjectPopoverId}
        >
          {project.ProgettiSerp_Nome || "Unnamed Project"}
          <EditIcon
            fontSize="inherit"
            sx={{ ml: 0.5, color: "text.secondary" }}
          />
        </Typography>
        <EditProjectPopup
          project={project}
          anchorEl={editProjectAnchorEl}
          onClose={onCloseEditProject}
          onProjectUpdated={onProjectUpdated}
        />
      </Grid>

      <Grid
        item
        xs={12}
        md={4}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*.png"
          onChange={onLogoChange}
          style={{ display: "none" }}
        />
        {projectLogo ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
              cursor: "pointer",
            }}
            onClick={handleLogoButtonClick}
          >
            <img
              src={projectLogo}
              alt="Project Logo"
              style={{ maxHeight: "60px", maxWidth: "150px" }}
            />
            
          </Box>
        ) : (
          <Button
            variant="outlined"
            sx={{ minWidth: "120px", mb: 1 }}
            onClick={handleLogoButtonClick}
            startIcon={<AddPhotoAlternateIcon />}
          >
            Insert logo
          </Button>
        )}
      </Grid>

      <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <CalendarTodayIcon fontSize="small" />
          <Typography variant="body2">Data inserimento:</Typography>
        </Box>
        <Typography variant="body1" fontWeight="bold">
          {FormatDate(project.dataInserimento, "dd-MM-yyyy")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
            mt: 0.5,
          }}
        >
          <CalendarTodayIcon fontSize="small" />
          <Typography variant="body2">Data ultimo report:</Typography>
        </Box>
        <Typography variant="body1" fontWeight="bold">
          {FormatDate(
            project.dataEstrazione || project.dataKeyword,
            "dd-MM-yyyy"
          )}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default ProjectDetailHeader;
