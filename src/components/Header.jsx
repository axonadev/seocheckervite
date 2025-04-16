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
      
      {/* Fixed search bar */}
      <Box
        sx={{
          position: 'fixed',
          top: '64px', // Height of AppBar
          left: '72px', // Width of sidebar
          right: 0,
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'center',
          padding: '16px',
          paddingLeft: '24px', // Reduced from 48px to 24px to move closer to sidemenu
          backgroundColor: '#f6f6f6',
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
            border: '1px solid #6750A4'
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
