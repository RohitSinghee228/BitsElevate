import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
  HStack,
  Icon,
  useBreakpointValue
} from '@chakra-ui/react';
import { FaPaperPlane, FaEnvelope, FaBell, FaCertificate } from 'react-icons/fa';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const isSmallScreen = useBreakpointValue({ base: true, md: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid email address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmail('');
      toast({
        title: 'Success!',
        description: 'You have been subscribed to our newsletter.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 1500);
  };

  const benefits = [
    {
      icon: FaEnvelope,
      text: 'Weekly curated learning resources'
    },
    {
      icon: FaBell,
      text: 'New course announcements'
    },
    {
      icon: FaCertificate,
      text: 'Exclusive discounts and offers'
    }
  ];

  return (
    <Box py={16} bg="blue.600">
      <Container maxW="container.xl">
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          align="center"
          gap={10}
        >
          <VStack 
            align={{ base: 'center', lg: 'flex-start' }} 
            spacing={4}
            maxW={{ base: '100%', lg: '50%' }}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            <Heading
              as="h2"
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="bold"
              color="white"
            >
              Stay Updated with BitsElevate
            </Heading>
            
            <Text fontSize="lg" color="white" opacity={0.9} mb={2}>
              Subscribe to our newsletter for the latest courses, educational trends, and exclusive offers.
            </Text>
            
            <VStack align={isSmallScreen ? 'center' : 'flex-start'} spacing={3} mt={2}>
              {benefits.map((benefit, index) => (
                <HStack key={index} spacing={3}>
                  <Flex
                    w="36px"
                    h="36px"
                    bg="blue.500"
                    borderRadius="full"
                    justify="center"
                    align="center"
                  >
                    <Icon as={benefit.icon} color="white" fontSize="md" />
                  </Flex>
                  <Text color="white" fontSize="md">
                    {benefit.text}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>

          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            boxShadow="xl"
            w={{ base: '100%', md: '450px' }}
          >
            <VStack as="form" onSubmit={handleSubmit} spacing={4} align="stretch">
              <Heading as="h3" fontSize="xl" mb={2}>
                Join Our Community
              </Heading>
              
              <Text color="gray.600" mb={2}>
                Over 25,000 educators and learners have already subscribed!
              </Text>
              
              <FormControl isRequired>
                <Input
                  type="email"
                  placeholder="Your email address"
                  size="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  borderWidth="2px"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                />
                <FormHelperText>We respect your privacy. No spam, ever.</FormHelperText>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                rightIcon={<FaPaperPlane />}
                isLoading={isLoading}
                loadingText="Subscribing..."
                w="100%"
              >
                Subscribe Now
              </Button>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Newsletter; 