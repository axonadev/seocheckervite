import { createSlice } from "@reduxjs/toolkit";

export const isMenuOpenSlice = createSlice({
  name: "isMenuOpen",
  initialState: {
    value: { open: false },
  },
  reducers: {
    trigger: (state) => {
      state.value.open = !state.value.open;
    },
    chiudiMenu: (state) => {
      state.value.open = false;
    },
  },
});

export const { trigger, chiudiMenu } = isMenuOpenSlice.actions;

export default isMenuOpenSlice.reducer;
