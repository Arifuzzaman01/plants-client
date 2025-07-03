import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import "./checkoutForm.css";
import { useEffect, useState } from "react";
import { ClockLoader } from "react-spinners";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const CheckoutForm = ({ totalPrice, orderData }) => {
  // console.log(orderData);
  const axiosSecure = useAxiosSecure();
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const { user } = useAuth();
  // console.log(orderData);
  useEffect(() => {
    const getClientSecret = async () => {
      const { data } = await axiosSecure.post("/create-client-intent", {
        quantity: orderData?.quantity,
        plantId: orderData?.plantId,
        price: orderData?.price,
      });
      setClientSecret(data?.clientSecret);
    };
    getClientSecret();
  }, [axiosSecure, orderData]);
  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();
    setProcessing(true);
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const card = elements.getElement(CardElement);

    if (card == null) {
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      console.log("[error]", error);
      setCardError(error.message);
      setProcessing(false);
      return;
    } else {
      console.log("[PaymentMethod]", paymentMethod);
      setCardError(null);
    }
    //   taka aso katbo
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name: user?.displayName,
          email: user?.email,
        },
      },
    });
    if (result.error) {
      setCardError(result.error.message);
      return;
    }
    if (result.paymentIntent.status === "succeeded") {
      // save payment data in db
      try {
        orderData.transactionId = result?.paymentIntent?.id;
        const { data } = await axiosSecure.post("/orders", orderData);
        if (data.insertedId) {
          toast.success("order placed successfully");
        }
        // update product count
        console.log(orderData?.plantId);
        const { data: result } = await axiosSecure.patch(
          `/quantity-update/${orderData?.plantId}`,
          { quantityToUpdate: orderData.quantity, status: "decrease" }
        );
        console.log(result, "update quantity");
      } catch (error) {
        console.log(error);
      } finally {
        setProcessing(false);
        setCardError(null);
      }
      // update product quantity in db plant collection
    }
    console.log(result);
    // setProcessing(false)
  };
  // setProcessing(false)
  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
      {cardError && <p className="text-sm text-red-500">{cardError}</p>}
      <button
        className="btn bg-[#5EBB2B] btn-block"
        type="submit"
        disabled={!stripe || processing}
      >
        {processing ? <ClockLoader size={25} /> : `Pay $ ${totalPrice}`}
      </button>
    </form>
  );
};

export default CheckoutForm;
