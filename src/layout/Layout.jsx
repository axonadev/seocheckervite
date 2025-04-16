import React, { useEffect, useState } from "react";
import SideMenu from "../components/SideMenu";
import Fab from "../components/Fab";
import { Box } from "@mui/material";
import { LoginByToken } from "../utility/CallLogin";
import { login } from "../store/storeLogin";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

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
    getLogin();
  }, []);

  return (
    <>
      <Header />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          justifyItems: "center",
          borderRadius: "7px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minHeight: "calc(100vh - 238px)",
          }}
        >
          {dimensions.width >= 600 ? <SideMenu /> : <Fab />}
          {children}
        </Box>
      </Box>

      <Footer />
    </>
  );
};

export default Layout;
