import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import useAuth from "../../hooks/useAuth";
import { useState } from "react";
import toast from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../Form/CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_PK_KEY);
const PurchaseModal = ({ closeModal, isOpen, plants }) => {
  // Total Price Calculation
  const { user } = useAuth();
  const { name, description, quantity, price, _id, seller, image, category } =
    plants;
  console.log(price);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(price);
  const [orderData, setOrderData] = useState({
    customer: {
      name: user?.displayName,
      email: user?.email,
      images: user?.photoURL,
    },
    seller,
    plantId: _id,
    price: price,
    plantName: name,
    quantity: quantity,
    plantImage: image,
  });

  console.log(selectedQuantity);
  // console.log(typeof(quantity));
  const handleSelectedQuantity = (value) => {
    const convertedQuantity = parseInt(value);
    // console.log(typeof(convertedQuantity));
    if (convertedQuantity > quantity) {
      return toast.error("You cress quantity limitation");
    }
    // console.log(convertedQuantity);
    const calculatePrice = convertedQuantity * price;
    setSelectedQuantity(convertedQuantity);
    setTotalPrice(calculatePrice);
    setOrderData((prev) => {
      return {
        ...prev,
        price,
        quantity: selectedQuantity,
      };
    });
  };
  // console.log(orderData);
  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none "
      onClose={closeModal}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 shadow-xl rounded-2xl"
          >
            <DialogTitle
              as="h3"
              className="text-lg font-medium text-center leading-6 text-gray-900"
            >
              Review Info Before Purchase
            </DialogTitle>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Plant: {name}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Category: {category}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Customer: {user.displayName}
              </p>
            </div>

            <div className="mt-2">
              <p className="text-sm text-gray-500">Price par Unit: $ {price}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Available Quantity: {quantity}
              </p>
            </div>
            <p className="text-center">Order info</p>
            <hr className="mt-2" />
            <div className="mt-2 flex justify-between">
              <p className="flex-1/2">Select Quantity -> </p>
              <input
                value={selectedQuantity}
                onChange={(e) => handleSelectedQuantity(e.target.value)}
                type="number"
                min={1}
                max={quantity}
                className="border flex-1/2 rounded-sm py-1 px-2"
              />
            </div>

            <div className="mt-2">
              <p className=" text-gray-500">
                Total price: {totalPrice}{" "}
                <span className="text-sm text-black ml-3">
                  {" "}
                  (selected quantity * price par unit)
                </span>
              </p>
            </div>
            {/* stripe checkOut form */}
            <div className="p-3 border rounded-sm">
              <Elements stripe={stripePromise}>
                <CheckoutForm totalPrice={totalPrice} orderData={orderData} />
              </Elements>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default PurchaseModal;
