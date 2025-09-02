import axios from "axios";

export const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "upload_Profile_Pic");

  const res = await axios.post("https://api.cloudinary.com/v1_1/dvt0tkt5x/image/upload", data);
  return res.data.secure_url;
};