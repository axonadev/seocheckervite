import { Box } from "@mui/material";
import Spinner from "./Spinner";

const Loader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 999,
      }}
    >
      <Spinner />
    </Box>
  );
};
export default Loader;
