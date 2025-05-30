import axios from "axios";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const sendEmail = async (toEmail, toName, subject, bodyText) => {
  const token = sessionStorage.getItem("token");

  if (toEmail && !isValidEmail(toEmail)) {
    const { data: userData } = await axios.request({
      method: "GET",
      url: `${process.env.REACT_APP_API_URL}user/${toEmail}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    toEmail = userData.email;
    if (!toName) {
      toName = userData.firstName + " " + userData.lastName;
    }
  }

  if (!isValidEmail(toEmail || "")) {
    return;
  }

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
    },
  };

  await axios.request(options).catch((e) => {
    console.error(e);
    throw e;
  });
};
