import React from "react";
import { Box } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HeaderIcon from "./HeaderIcon";
import { useSelector } from "react-redux";

const IconLogin = ({
  onClick = () => {},
  imgLogin = "https://placehold.co/40x40?text=G.G.",
}) => {
  const isLogged = useSelector((state) => state.isLogged.value.logged);

  const clickIcon = () => {
    onClick();
  };

  const randomInt = Math.floor(Math.random() * 101);

  return (
    <Box>
      <HeaderIcon isLogged={isLogged}>
        {isLogged ? (
          <Box
            onClick={clickIcon}
            sx={{
              width: "40px",
              height: "40px",
              backgroundImage: "url(" + imgLogin + ")",
              backgroundSize: "cover",
              filter:
                "grayscale(100%) sepia(" +
                randomInt +
                "%) hue-rotate(" +
                randomInt +
                "deg)",
            }}
          ></Box>
        ) : (
          <AccountCircleIcon
            sx={{ fontSize: "40px" }}
            onClick={clickIcon}
          ></AccountCircleIcon>
        )}
      </HeaderIcon>
    </Box>
  );
};
export default IconLogin;
