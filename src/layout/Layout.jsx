import React, { useEffect, useState } from "react";
import SideMenu from "../components/SideMenu";
import SearchBar from "../components/SearchBar";
import { Box } from "@mui/material";
import { LoginByToken } from "../utility/CallLogin";
import { login } from "../store/storeLogin";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from './Layout.module.css';

import useDevice from "../hooks/useDevice";
import Header from "../components/Header";


const Layout = ({ children, onProjectAdded, showSearchBar = true, onSearch = () => {}, label = "Home", filterBar }) => {
  const naviga = useNavigate();
  const { dimensions } = useDevice(); 
  const sessionToken = localStorage.getItem("axo_token");
  const dispatch = useDispatch();


  const getLogin = async () => {
    console.log(sessionToken, "sessionToken");
    if (!sessionToken) {
      naviga("/login");
    } else {
      const valToken = await LoginByToken(sessionToken);
      dispatch(login(valToken));
    }
  };

  useEffect(() => {
    /* getLogin(); */
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <Header label = {label}/>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <SideMenu onProjectAdded={onProjectAdded}  />
        <Box
          sx={{
           marginLeft: "60px",
           marginTop: "60px",
           backgroundColor: '#FAFBFC',
           p: 2,
           flexGrow: 1
          }}
        >
          {showSearchBar && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SearchBar onSearch={onSearch} />
              {filterBar}
            </Box>
          )}
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
