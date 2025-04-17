import 'react-toastify/dist/ReactToastify.css';

import { Button, FormControl, FormLabel } from "@chakra-ui/react";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";

import { loadStripe } from "@stripe/stripe-js";
import { toast } from 'react-toastify';
import { useState } from "react";

const publishableKey = 'pk_test_51RBrgoBT4CcWVFBYYcQidg8BbC5FMXlxgMq3Vxc8q9udd425oV2esJZau6cdQLMwPYiUj4JqWQbxHzckplmBbnyg001IK3NipC';
const stripePromise = loadStripe(publishableKey);

interface UpdatePaymentDataFormProps {
  userId: string;
  authToken: string;
  onClose: () => void;
}

const UpdatePaymentDataForm = ({ userId, authToken, onClose }: UpdatePaymentDataFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    if (!stripe || !elements) {
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;
    
    const { token, error } = await stripe.createToken(cardElement);
    if (error) {
      setError(error.message || 'An error occurred');
      setLoading(false);
    } else {
      try {
        const response = await fetch(
          `http://localhost:7072/api/paymentMangement/update-card`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              userId,
              updatedCardDetails: {
                token: token.id,
              },
            }),
          }
        );

        const responseData = await response.json();
        if (responseData.message === 'Card details updated successfully') {
          toast.success('Card details updated successfully');
          onClose();
        } else {
          setError('Failed to save card');
          toast.error('Failed to save card');
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError('Failed to save card');
        toast.error('Failed to save card');
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel>Card Details</FormLabel>
        <CardElement />
      </FormControl>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <Button
        mt={4}
        colorScheme="blue"
        isLoading={loading}
        type="submit"
        disabled={!stripe}
      >
        update card
      </Button>
    </form>
  );
}

const UpdatePaymentData = ({ userId, authToken, onClose }: UpdatePaymentDataFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <UpdatePaymentDataForm userId={userId} authToken={authToken} onClose={onClose} />
    </Elements>
  );
};

export default UpdatePaymentData;
