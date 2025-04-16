import React from "react";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";

import ContactMailIcon from "@mui/icons-material/ContactMail";
import { Box } from "@mui/system";

const SideMenu = () => {
  return (
    <Box>
      <Box>
        <Link to="/home">
          <HomeIcon />
        </Link>
      </Box>
      <Box>
        <Link to="/about">
          <InfoIcon />
        </Link>
      </Box>
      <Box>
        <Link to="/contact">
          <ContactMailIcon />
        </Link>
      </Box>
    </Box>
  );
};

export default SideMenu;
