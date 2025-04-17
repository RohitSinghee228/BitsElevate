import 'react-toastify/dist/ReactToastify.css';

import { Button, FormControl, FormLabel } from '@chakra-ui/react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';

import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';

const publishableKey = 'pk_test_51RBrgoBT4CcWVFBYYcQidg8BbC5FMXlxgMq3Vxc8q9udd425oV2esJZau6cdQLMwPYiUj4JqWQbxHzckplmBbnyg001IK3NipC';
const stripePromise = loadStripe(publishableKey);

interface AddPaymentDataFormProps {
  userId: string;
  authToken: string;
  onClose: () => void;
}

const AddPaymentDataForm: React.FC<AddPaymentDataFormProps> = ({ userId, authToken, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Starting card submission process');
    console.log('Stripe status:', stripe ? 'initialized' : 'not initialized');
    console.log('Elements status:', elements ? 'initialized' : 'not initialized');
    
    setLoading(true);
    if (!stripe || !elements) {
      console.error('Stripe or Elements not initialized');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error('Card element not found');
      setError('Card element not found');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Creating Stripe token...');
      const { token, error: tokenError } = await stripe.createToken(cardElement);
      
      if (tokenError) {
        console.error('Token creation error:', tokenError);
        setError(tokenError.message || 'Failed to create token');
        setLoading(false);
        return;
      }

      console.log('Token created successfully:', token.id);
      console.log('Sending request to backend with data:', {
        token: token.id,
        userId
      });

      const response = await axios.post(
        'http://localhost:7072/api/paymentMangement/save-card',
        {
          token: token.id,
          userId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log('Backend response:', response.data);

      // Check for success message in either format
      if (response.data.message?.includes('Card saved successfully')) {
        console.log('Card saved successfully');
        toast.success('Card saved successfully');
        onClose();
      } else {
        console.error('Unexpected response:', response.data);
        setError(response.data.message || 'Failed to save card');
        toast.error(response.data.message || 'Failed to save card');
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = (axiosError.response?.data as { message?: string })?.message || 'Failed to save card';
      console.error('Error in card submission:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
        Save Card
      </Button>
    </form>
  );
};

interface AddPaymentDataProps {
  userId: string;
  authToken: string;
  onClose: () => void;
}

const AddPaymentData: React.FC<AddPaymentDataProps> = ({ userId, authToken, onClose }) => {
  return (
    <Elements stripe={stripePromise}>
      <AddPaymentDataForm userId={userId} authToken={authToken} onClose={onClose} />
    </Elements>
  );
};

export default AddPaymentData;
