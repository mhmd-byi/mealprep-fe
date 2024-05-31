import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useHeader = () => {
  const navigate = useNavigate();
  const logout = () => {
    const token = sessionStorage.getItem("token");
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (!refreshToken) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("tokenExpireDate");
      sessionStorage.removeItem("userId");
      navigate("/");
      return;
    }

    axios({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      url: `${process.env.REACT_APP_API_URL}user/logout`,
      data: {
        refreshToken: refreshToken,
      },
    })
      .then(() => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("tokenExpireDate");
        sessionStorage.removeItem("userId");
        navigate("/");
      })
      .catch((err) => {
        console.log("Logout error: ", err);
      });
  };

  return {
    logout,
  };
};
