import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";

import App from "./App.jsx";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { Provider as Redux } from "react-redux";
import { CssBaseline } from "@mui/material";

import "./index.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#202867",
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      //contrastText: will be calculated to contrast with palette.primary.main
      transparentContrastText: "rgba(255, 255, 255, 0.6)",
      contrastLink: "#646cff",
      error: "#ff6464",
    },
    secondary: {
      main: "#DB9B6A",
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
  },

  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#DB9B6A",
          ":hover": { color: "#FB9B6A" },
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: "containedInverter" },
          style: {
            borderRadius: "7px",
            backgroundColor: "#DB9B6A",
            textTransform: "none",
            border: "2px solid white",
            ":hover": {
              backgroundColor: "#FB9B6A",
            },
          },
        },
        {
          props: { variant: "attenzione" },
          style: {
            backgroundColor: "#CC0000",

            color: "white",
            ":hover": {
              backgroundColor: "#FF0000",
            },
          },
        },
      ],
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "Roboto, sans-serif",
          backgroundColor: "#f6f6f6",
          width: "100%",
          margin: "0",
          padding: "0",
          minWidth: "320px",
          minHeight: "100vh",
          color: "#202867",
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

// Rendering dell'app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Redux store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </PersistGate>
    </Redux>
  </React.StrictMode>
);
