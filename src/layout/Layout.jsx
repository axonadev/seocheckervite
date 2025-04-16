import React, { useEffect, useState } from "react";
import SideMenu from "../components/SideMenu";
import Fab from "../components/Fab";
import SearchBar from "../components/SearchBar/SearchBar";
import { Box } from "@mui/material";
import { LoginByToken } from "../utility/CallLogin";
import { login } from "../store/storeLogin";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from './Layout.module.css';

import useDevice from "../hooks/useDevice";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Layout = ({ children }) => {
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
      <Header />
      <SideMenu />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px',
          ml: '240px',
          p: 3,
          backgroundColor: '#FAFBFC'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
