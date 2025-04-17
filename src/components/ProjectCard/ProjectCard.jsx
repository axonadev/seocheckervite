import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, Stack } from '@mui/material';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UpdateIcon from '@mui/icons-material/Update';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TagIcon from '@mui/icons-material/Tag';
import {FormatDate} from '../../utility/FormatDate';

const ProjectCard = ({ project }) => {
  // For debugging
  console.log("Card rendering with project:", project);

  // Get the domain from appropriate fields
  const domainToDisplay = project.ProgettiSerp_DNS || project.domain || "No domain";
  
  // Get the keyword count
  const keywordCount = project.totaleKeyword || project.keywords || 0;

  return (
    <Card sx={{ 
      minWidth: 275, 
      m: 1,
      borderRadius: 3,
      boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
          {project.ProgettiSerp_Nome || "Unnamed Project"}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={2}>
          <LanguageIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          <Typography color="text.secondary" variant="body2">
            {domainToDisplay}
          </Typography>
        </Box>

        <Stack spacing={1.5} mb={3}>
          <Box display="flex" alignItems="center">
            <AccessTimeIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            <Typography variant="body2">
              Ultimo Report: {FormatDate(project.ProgettiSerp_UltimoReport || project.dataKeyword || new Date(), 'dd/MM/yyyy')}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <TagIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            <Chip 
              label={`${keywordCount} keywords`}
              size="small"
              sx={{ 
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: 'primary.main',
              }}
            />
          </Box>
        </Stack>

        <Box display="flex" gap={2}>
          <Button 
            variant="contained" 
            startIcon={<ArchiveOutlinedIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              flex: 1,
            }}
          >
            Archivia
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<UpdateIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              flex: 1,
            }}
          >
            Aggiorna
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
