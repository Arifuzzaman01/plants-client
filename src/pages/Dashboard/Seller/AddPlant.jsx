import axios from "axios";
import AddPlantForm from "../../../components/Form/AddPlantForm";
import { imageUpload } from "../../../api/utils";
import { useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";

const AddPlant = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const handleAddPlant = async (e) => {
    e.preventDefault();
    setUploading(true);
    const form = e.target;
    const name = form.name.value;
    const category = form.category.value;
    const description = form.description.value;
    const price = form.price.value;
    const quantity = form.quantity.value;
    const image = form?.image?.files[0];
    const seller = {
      sellerName: user.displayName,
      sellerEmail: user.email,
      sellerImage: user?.photoURL,
    };
    try {
      const imageURL = await imageUpload(image);
      const formPlanet = {
        name,
        category,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        image: imageURL,
        seller,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/add-plant`,
        formPlanet
      );
      toast.success("Your data is uploading successfully");
      form.reset();
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      {/* Form */}
      <AddPlantForm handleAddPlant={handleAddPlant} uploading={uploading} />
    </div>
  );
};

export default AddPlant;
