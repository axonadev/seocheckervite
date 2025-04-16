import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { trigger } from "../store/isMenuOpen";

import UserMenu from "./UserMenu";
import IconLogin from "./IconLogin";

const Header = ({ loginVisible }) => {
  const Token = localStorage.getItem("axo_token");
  const naviga = useNavigate();

  const nomeSoggetto = useSelector((state) => state.auth.value.nomesoggetto);

  const cognomeSoggetto = useSelector(
    (state) => state.auth.value.cognomesoggetto
  );
  const openMenu = useSelector((state) => state.isMenuOpen.value.open);

  const goUser = () => {
    dispatch(trigger());
  };

  const [iniziali, setIniziali] = useState("");

  useEffect(() => {
    setIniziali(
      nomeSoggetto?.charAt(0) + "." + cognomeSoggetto?.charAt(0) + "."
    );
  }, [nomeSoggetto, cognomeSoggetto]);

  return (
    <>
      <Box id="header">
        <Box
          sx={{
            position: "relative",
            width: "100%",
            minHeight: "100px",
            display: "flex",
            textAlign: "center",
            justifyContent: "center",
            paddingTop: "10px",
            zIndex: "100",
            backgroundColor: "primary.contrastText",
            backgroundImage: "url('https://picsum.photos/1200/300')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignContent: "center",
              verticalAlign: "middle",
              height: "100%",
            }}
            onClick={() => {
              naviga("/dashboard");
            }}
          >
            <img
              style={{ maxWidth: "300px" }}
              src="/icon/logo.png"
              loading="lazy"
            ></img>
          </Box>

          {loginVisible ? (
            <IconLogin
              onClick={goUser}
              imgLogin={"https://placehold.co/40x40?text=" + iniziali}
            >
              <Typography
                sx={{ fontSize: "0.8rem", fontWeight: "600" }}
              ></Typography>
            </IconLogin>
          ) : null}
        </Box>
        <Box
          sx={{
            position: "fixed",
            top: "0",
            width: "100%",
            display: "flex",
            padding: "10px",
            zIndex: "90",
            justifyContent: "space-between",
            backgroundColor: "primary.contrastText",
            backgroundImage: "url('https://picsum.photos/1200/300')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
          }}
        >
          <Box
            sx={{
              float: "left",
              width: "calc(50% + 40px)",
              display: "flex",
              justifyContent: "space-between",
              height: "50px",
            }}
            onClick={() => {
              naviga("/dashboard");
            }}
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
              <img
                src="/icon/logo.png"
                loading="lazy"
                style={{ maxWidth: "100px", maxHeight: "50px" }}
              ></img>
            </Box>
            <Box
              sx={{
                position: "absolute",
                top: "70px",
                left: "0",
                right: "0",
                color: "primary.main",
                backgroundColor: "primary.contrastText",
              }}
            ></Box>
          </Box>
        </Box>
      </Box>
      {openMenu ? <UserMenu></UserMenu> : ""}
    </>
  );
};
export default Header;
