import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const signup = async (userData) => {
  return await axios.post(`${API_URL}/signup`, userData);
};
