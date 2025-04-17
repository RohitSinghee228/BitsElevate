import { Box, Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { FaCcAmex, FaCcDiscover, FaCcMastercard, FaCcVisa } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';

interface CardDetails {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
}

interface ViewPaymentDataProps {
  userId: string;
  authToken: string;
}

const ViewPaymentData: React.FC<ViewPaymentDataProps> = ({ userId, authToken }) => {
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardDetails = async () => {
      setLoading(true);
      try {
        console.log('Fetching card details for userId:', userId);
        const response = await fetch(
          `http://localhost:7072/api/paymentMangement/get-card?userId=${userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Received card details:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch card details');
        }

        if (data.status === 'error') {
          if (data.code === 'CARD_NOT_FOUND') {
            setCardDetails(null);
            setError('No card details found');
            return;
          }
          throw new Error(data.message || 'Failed to fetch card details');
        }

        // Handle both direct data and nested data structure
        const cardData = data.data || data;
        if (cardData) {
          setCardDetails({
            id: cardData.id,
            last4: cardData.last4,
            brand: cardData.brand,
            exp_month: cardData.exp_month,
            exp_year: cardData.exp_year
          });
          setError(null);
        } else {
          setCardDetails(null);
          setError('No card details available');
        }
      } catch (error) {
        console.error('Error fetching card details:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch card details');
        setCardDetails(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCardDetails();
    }
  }, [userId, authToken]);

  const renderCardIcon = () => {
    if (!cardDetails?.brand) return null;

    const brand = cardDetails.brand.toLowerCase();
    switch (brand) {
      case 'visa':
        return <FaCcVisa size={24} />;
      case 'mastercard':
        return <FaCcMastercard size={24} />;
      case 'amex':
        return <FaCcAmex size={24} />;
      case 'discover':
        return <FaCcDiscover size={24} />;
      default:
        return null;
    }
  };

  const renderCardDigits = () => {
    if (!cardDetails?.last4) return null;
    return `**** **** **** ${cardDetails.last4}`;
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Card Details
      </Text>
      {loading ? (
        <Flex align="center">
          <Spinner mr={2} />
          <Text>Loading card details...</Text>
        </Flex>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : cardDetails ? (
        <VStack spacing={4} align="start">
          <Flex align="center" gap={2}>
            {renderCardIcon()}
            <Text>{renderCardDigits()}</Text>
          </Flex>
          <Text>Expiry Date: {cardDetails.exp_month}/{cardDetails.exp_year}</Text>
        </VStack>
      ) : (
        <Text>No card details available.</Text>
      )}
    </Box>
  );
};

export default ViewPaymentData;
