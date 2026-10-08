import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const S3_BUCKET = process.env.REACT_APP_API_S3_BUCKET_NAME;
const REGION = process.env.REACT_APP_API_S3_REGION;
const ACCESS_KEY = process.env.REACT_APP_API_S3_ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.REACT_APP_API_S3_SECRET_ACCESS_KEY;

AWS.config.update({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: REGION,
});

const s3 = new AWS.S3();

export const uploadFileToS3 = async (file) => {
  if (!file) return null;
  const fileName = `${uuidv4()}-${file.name}`;
  const params = { Bucket: S3_BUCKET, Key: fileName, Body: file };
  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (err) {
    console.error("Error uploading file to S3:", err);
    return null;
  }
};
