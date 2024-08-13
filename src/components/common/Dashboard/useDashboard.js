import axios from "axios";
import { useEffect, useState } from "react";

export const useDashboard = () => {
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    profileImageUrl: "",
    postalAddress: "",
    password: "",
    confirmPassword: "",
    role: "user", // Add role field with default value
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
        postalAddress: res.data.postalAddress,
        password: res.data.password,
        confirmPassword: res.data.confirmPassword,
        role: res.data.role || "user", // Include role, default to "user" if not provided
      });
    });
    return false;
  };

  const getInitials = () => {
    if (
      !userDetails.profileImageUrl &&
      userDetails.firstName &&
      userDetails.lastName
    ) {
      return userDetails.firstName.charAt(0) + userDetails.lastName.charAt(0);
    }
    return "";
  };

  return {
    userDetails,
    getInitials,
    setUserDetails,
  };
};