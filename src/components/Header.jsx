import React from 'react';
import { AppBar, Toolbar, Typography, Box, InputBase, Paper } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import SearchIcon from '@mui/icons-material/Search';

const Header = () => {
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
        </Toolbar>
      </AppBar>
      
      {/* Search bar centered in main content */}
      <Box
        sx={{
          width: 'calc(100% - 72px)',  // Account for sidebar width
          display: 'flex',
          justifyContent: 'center',
          mt: 0,  // Reduced margin top
          px: 3,
          ml: '72px', 
        }}
      >
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: 600,
            backgroundColor: '#EEE8F4',
            borderRadius: '28px',
            height: '40px',
            px: 1,
            border: '1px solid #6750A4'  // Add purple border
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon sx={{ color: '#49454F' }} />
          </Box>
          <InputBase
            placeholder="Ricerca progetti"
            sx={{
              flex: 1,
              color: '#49454F',
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '0.15px',
              fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontWeight: 400,
            }}
          />
        </Paper>
      </Box>
    </>
  );
};

export default Header;
