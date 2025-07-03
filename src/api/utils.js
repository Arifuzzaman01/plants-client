import axios from "axios";

export const imageUpload = async (image) => {
  const imageFormData = new FormData();
  imageFormData.append("image", image);
  const { data } = await axios.post(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API}`,
    imageFormData
  );
  return data.data.display_url;
};
// save user data in db

export const saveUserInDb = async (user) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/user`,
    user
  );
  console.log(data);
};
