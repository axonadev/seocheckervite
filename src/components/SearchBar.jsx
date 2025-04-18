import React, { useState } from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleChange = (e) => {
    setSearchInput(e.target.value);
    onSearch(e.target.value); // For real-time search
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '600px',
        margin: '16px auto',
        padding: '4px 16px',
        borderRadius: '24px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        backgroundColor: '#F4F4F4',
      }}
    >
      <IconButton 
        type="submit"
        sx={{ 
          p: '10px', 
          color: '#673ab7',
        }} 
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
      <InputBase
        sx={{
          ml: 1,
          flex: 1,
          color: '#333',
          '& input::placeholder': {
            color: '#666',
            opacity: 1,
          },
        }}
        placeholder="Ricerca progetti"
        inputProps={{ 'aria-label': 'ricerca progetti' }}
        value={searchInput}
        onChange={handleChange}
        onFocus={(e) => e.target.placeholder = ''}
        onBlur={(e) => e.target.placeholder = 'Ricerca progetti'}
      />
    </Paper>
  );
};

export default SearchBar;
