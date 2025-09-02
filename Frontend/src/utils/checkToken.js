import jwtDecode from "jwt-decode";

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    const expiryDate = decoded.exp * 1000;
    return Date.now() >= expiryDate;
  } catch (error) {
    console.error("Token decode error:", error);
    return true;
  }
};
