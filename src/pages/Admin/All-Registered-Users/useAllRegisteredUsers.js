import { useEffect, useState } from "react";
import axios from "axios";

export const useAllRegisteredUsers = () => {
  const [allRegisteredUsers, setAllRegisteredUsers] = useState([]);
  const token = sessionStorage.getItem("token");

  const getAllUsers = async () => {
    try {
      const response = await axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_URL}user/all`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllRegisteredUsers(response.data);
    } catch (e) {
      console.log('error processing request', e);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return {
    allRegisteredUsers,
  };
};