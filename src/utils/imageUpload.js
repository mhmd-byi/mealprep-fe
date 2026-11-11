import axios from "axios";

const MAX_SIDE = 1600;
const MAX_BASE64_CHARS = 1.9 * 1024 * 1024;

const base = () => process.env.REACT_APP_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });

export const failureText = (error, fallback) => error?.response?.data?.message || (error?.uploadFailed ? error.message : fallback);

const asUploadError = (error, fallback) =>
  Object.assign(new Error(error?.response?.data?.message || error?.message || fallback), { uploadFailed: true });

const fileToJpegBase64 = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let quality = 0.88;
      let data = canvas.toDataURL("image/jpeg", quality);
      while (data.length > MAX_BASE64_CHARS && quality > 0.4) {
        quality -= 0.1;
        data = canvas.toDataURL("image/jpeg", quality);
      }
      URL.revokeObjectURL(url);
      resolve(data.split(",")[1]);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file is not an image."));
    };
    image.src = url;
  });

export const uploadAdminImage = async (file, folder) => {
  try {
    const image = await fileToJpegBase64(file);
    const response = await axios.post(
      `${base()}admin/upload-image`,
      { image, contentType: "image/jpeg", folder, name: file.name },
      auth()
    );
    return response.data.url;
  } catch (error) {
    throw asUploadError(error, "Could not upload the image. Please try again.");
  }
};

export const deleteUnsavedImage = async (url) => {
  if (!url) return;
  try {
    await axios.delete(`${base()}admin/upload-image`, { ...auth(), data: { url } });
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

export const uploadProfilePhoto = async (userId, file) => {
  try {
    const image = await fileToJpegBase64(file);
    const response = await axios.post(`${base()}user/${userId}/profile-photo`, { image, contentType: "image/jpeg" }, auth());
    return response.data.profileImageUrl;
  } catch (error) {
    throw asUploadError(error, "Could not update your profile photo. Please try again.");
  }
};
