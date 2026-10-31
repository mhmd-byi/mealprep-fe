import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const getS3Client = () => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_API_S3_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_API_S3_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_API_S3_REGION,
  });
  return new AWS.S3();
};

export const uploadImageToS3 = async (file) => {
  const data = await getS3Client()
    .upload({
      Bucket: process.env.REACT_APP_API_S3_BUCKET_NAME,
      Key: `note-${uuidv4()}-${file.name}`,
      Body: file,
      ContentType: file.type,
    })
    .promise();
  return data.Location;
};

export const deleteFileFromS3 = async (url) => {
  if (!url) return;
  try {
    const key = decodeURIComponent(url.split("/").pop().split("?")[0]);
    await getS3Client()
      .deleteObject({ Bucket: process.env.REACT_APP_API_S3_BUCKET_NAME, Key: key })
      .promise();
  } catch (err) {
    console.error("Error deleting file:", err);
  }
};
