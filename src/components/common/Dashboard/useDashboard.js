import axios from "axios";
import { useEffect, useState } from "react";

export const useDashboard = () => {
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    profileImageUrl: "",
  });

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
  useEffect(() => {
    getUserData();
  }, [token, userId]);
  const getUserData = () => {
    axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_URL}user/${userId}`,
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    }).then((res) => {
      setUserDetails({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        mobile: res.data.mobile,
        email: res.data.email,
        profileImageUrl: res.data.profileImageUrl,
      });
    });
    return false;
  };

  return {
    userDetails,
  };
};
