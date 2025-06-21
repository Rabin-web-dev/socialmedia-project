import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) : null;


const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: user || null,
    token: localStorage.getItem("token") || null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { setCredentials, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
