import { createSlice } from "@reduxjs/toolkit";

export const storeLogin = createSlice({
  name: "auth",
  initialState: {
    value: {
      token: "",
      logged: false,
      guest: true,
      authlevel: 0,
      nomesoggetto: "GUEST",
      cognomesoggetto: "GUEST",
    },
  },
  reducers: {
    reset: (state) => {
      state.value = {
        token: "",
        logged: false,
        guest: true,
        authlevel: 0,
        nomesoggetto: "GUEST",
        cognomesoggetto: "GUEST",
      };
    },
    setToken: (state, action) => {
      state.value.token = action.payload;
    },
    login: (state, action) => {
      state.value.token = action.payload.Token || action.payload.token;
      state.value.logged = true;
      state.value.guest = false;
      state.value.nomesoggetto =
        action.payload.NomeSoggetto ||
        action.payload.nomesoggetto ||
        "USER";
      state.value.cognomesoggetto =
        action.payload.CognomeSoggetto ||
        action.payload.cognomesoggetto ||
        "";
      state.value.authlevel =
        action.payload.AuthLevel || action.payload.authlevel || 1;
    },
    logout: (state) => {
      state.value = {
        token: "",
        logged: false,
        guest: true,
        authlevel: 0,
        nomesoggetto: "GUEST",
        cognomesoggetto: "GUEST",
      };
    },
    cambiaStato: (state, action) => {
      state.value.logged = action.payload;
    },
    authLevel: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { reset, setToken, login, logout, cambiaStato, authLevel } =
  storeLogin.actions;

export default storeLogin.reducer;
