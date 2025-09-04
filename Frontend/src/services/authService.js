import api from "../utils/api";

export const signup = (userData) => api.post("/auth/signup", userData);
export const login = (userData) => api.post("/auth/login", userData);
export const logout = () => api.post("/auth/logout");