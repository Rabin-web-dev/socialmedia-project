import axios from "axios";

const API_URL = "https://stark-socialmedia.onrender.com/api/auth";

export const signup = async (userData) => {
  return await axios.post(`${API_URL}/signup`, userData);
};
