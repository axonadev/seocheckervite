import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const Header = ({label="home"}) => {
  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1200,
          backgroundColor: "#6750A4",
          color: "#fff",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LanguageIcon sx={{ fontSize: 24 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontSize: '2.3rem',  // Increased from 1.5rem
                ml: 1
              }}
            >
              Seo Checker
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              ml: 2,
              opacity: 0.8
            }}
          >
            NKW: 20693 / 60000
          </Typography>

          <Typography 
            
              variant="body2"
              sx={{
                ml: 2,
                opacity: 0.8,
                flexGrow: 1,
                textAlign: 'right'
              }}
          >
            {label}
          </Typography>

        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
