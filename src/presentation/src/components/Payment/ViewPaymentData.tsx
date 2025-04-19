import { Box, Flex, Spinner, Text, VStack, Badge, Divider } from '@chakra-ui/react';
import { FaCcAmex, FaCcDiscover, FaCcMastercard, FaCcVisa } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';

interface CardDetails {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  isDefault?: boolean;
}

interface ViewPaymentDataProps {
  userId: string;
  authToken: string;
}

const ViewPaymentData: React.FC<ViewPaymentDataProps> = ({ userId, authToken }) => {
  const [cards, setCards] = useState<CardDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardDetails = async () => {
      setLoading(true);
      try {
        console.log('Fetching payment data for userId:', userId);
        const response = await fetch(
          `http://localhost:3001/api/payments/cards/${userId}`,
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

        // Handle data format - could be an array or single object
        const cardsData = data.data || [];
        
        // If it's a single object but not an array, convert it to an array
        const cardsArray = Array.isArray(cardsData) ? cardsData : [cardsData].filter(Boolean);
        
        console.log('Card data after processing:', cardsArray);
        
        if (cardsArray && cardsArray.length > 0) {
          setCards(cardsArray);
          setError(null);
        } else {
          setCards([]);
          setError('No card details available');
        }
      } catch (error) {
        console.error('Error fetching card details:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch card details');
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCardDetails();
    }
  }, [userId, authToken]);

  const renderCardIcon = (brand?: string) => {
    if (!brand) return null;

    const brandLower = brand.toLowerCase();
    switch (brandLower) {
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

  const formatCardNumber = (last4?: string) => {
    if (!last4) return null;
    return `**** **** **** ${last4}`;
  };

  const formatExpiryDate = (month?: number, year?: number) => {
    if (!month || !year) return null;
    
    // Format month to be two digits
    const formattedMonth = month < 10 ? `0${month}` : month.toString();
    
    // Format year to be last two digits if it's a 4-digit year
    const formattedYear = year.toString().length > 2 ? year.toString().slice(-2) : year.toString();
    
    return `${formattedMonth}/${formattedYear}`;
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Your Payment Cards
      </Text>
      {loading ? (
        <Flex align="center">
          <Spinner mr={2} />
          <Text>Loading card details...</Text>
        </Flex>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : cards.length > 0 ? (
        <VStack spacing={4} align="stretch" divider={<Divider />}>
          {cards.map((card, index) => (
            <Box key={card.id || index} p={3} borderRadius="md" bg="gray.50">
              <Flex justify="space-between" align="center" mb={2}>
                <Flex align="center" gap={2}>
                  {renderCardIcon(card.brand)}
                  <Text fontWeight="bold">{card.brand}</Text>
                </Flex>
                {card.isDefault && (
                  <Badge colorScheme="green">Default</Badge>
                )}
              </Flex>
              <Text>{formatCardNumber(card.last4)}</Text>
              <Text fontSize="sm" color="gray.600">
                Expires: {formatExpiryDate(card.exp_month, card.exp_year)}
              </Text>
              {/* Add debug info in development mode */}
              {process.env.NODE_ENV === 'development' && (
                <Box mt={2} p={2} bg="gray.100" fontSize="xs" fontFamily="monospace">
                  <Text>ID: {card.id}</Text>
                  <Text>Last4: {card.last4}</Text>
                  <Text>Brand: {card.brand}</Text>
                  <Text>Exp Month: {card.exp_month}</Text>
                  <Text>Exp Year: {card.exp_year}</Text>
                </Box>
              )}
            </Box>
          ))}
        </VStack>
      ) : (
        <Text>No cards on file. Add a card to make payments.</Text>
      )}
    </Box>
  );
};

export default ViewPaymentData;
