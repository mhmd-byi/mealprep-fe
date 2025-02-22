import axios from "axios";

export const sendEmail = async (toEmail, toName, subject, bodyText) => {
  const token = sessionStorage.getItem("token");
  
  const options = {
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}activity/email/send`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: {
      toEmail: toEmail,
      toName: toName,
      subject: subject,
      text: bodyText,
    }
  }

  try {
    const { data } = await axios.request(options);
    console.log(data);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};