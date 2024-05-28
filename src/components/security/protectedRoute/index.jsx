import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const tokenExpireDate = sessionStorage.getItem("tokenExpireDate");

  function isTokenValid(inputDateString) {
    const inputDate = new Date(inputDateString);
    const currentDate = new Date();
    return currentDate <= inputDate;
  }

  useEffect(() => {
    if (!token || (tokenExpireDate && !isTokenValid(tokenExpireDate))) {
      navigate("/");
      window.location.reload();
    }
  }, [token, tokenExpireDate, navigate]);

  if (!token || (tokenExpireDate && !isTokenValid(tokenExpireDate))) {
    return null;
  }

  return children;
};
