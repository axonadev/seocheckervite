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
      };
    },
    setToken: (state, action) => {
      state.value.token = action.payload;
    },
    login: (state, action) => {
      state.value.token = action.payload;
    },
    logout: (state) => {
      state.value.token = "";
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
