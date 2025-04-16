import React from "react";
import { Box } from "@mui/material";

const HeaderIcon = ({
  children,
  type = "normal" /*normal, circle*/,

  onClick = () => {},
  sx = {},
}) => {
  const styleBase = {
    backgroundColor: "primary.contrastText",
    position: "fixed",
    right: "35px",
    top: "12.5px",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    overflow: "hidden",
  };
  const clickHandler = () => {
    onClick();
  };

  return (
    <Box sx={{ ...styleBase, ...sx }}>
      <Box
        onClick={clickHandler}
        sx={{
          fontSize: "1.3rem",
          display: "flex",
          justifyContent: "end",
          textAlign: "end",
          cursor: "pointer",
          color: "primary.main",
          padding: type == "circle" ? "2px" : "0",
          width: type == "circle" ? "36px" : "auto",
          height: type == "circle" ? "36px" : "auto",
        }}
      >
        {type == "circle" ? (
          <Box
            sx={{
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              borderRadius: "50%",
            }}
          >
            {children}
          </Box>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
};
export default HeaderIcon;
