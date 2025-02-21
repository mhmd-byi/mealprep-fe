import axios from "axios";

export const sendEmail = async (toEmail, toName, subject, bodyText) => {
  const options = {
    method: "POST",
    url: "https://send.api.mailtrap.io/api/send",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Api-Token": process.env.REACT_APP_MAILTRAP_API_TOKEN,
      "Access-Control-Allow-Origin": "https://app.mealprep.co.in",
    },
    data: {
      to: [{ email: toEmail, name: toName }],
      from: [{ email: 'info@mealprep.co.in', name: 'Mealprep Info' }],
      headers: {'X-Message-Source': 'app.mealprep.co.in'},
      subject: subject,
      text: bodyText,
    }
  }

  try {
    const { data } = await axios.request(options);
    console.log(data);
  } catch (e) {
    console.error(e);
  }
};