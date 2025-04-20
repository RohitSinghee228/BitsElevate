import React from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  useBreakpointValue
} from '@chakra-ui/react';
import { FaArrowRight, FaPlay } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Hero = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const trustedCompanies = [
    'Microsoft', 'Google', 'Amazon', 'IBM', 'Oracle', 'Adobe'
  ];

  return (
    <Box 
      bg="gray.50" 
      position="relative" 
      overflow="hidden"
      pt={{ base: 20, md: 28 }} 
      pb={{ base: 20, md: 24 }}
    >
      {/* Background decorative elements */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        width="300px"
        height="300px"
        bg="blue.500"
        opacity="0.1"
        borderRadius="full"
        zIndex={0}
      />
      
      <Box
        position="absolute"
        bottom="-15%"
        left="-10%"
        width="400px"
        height="400px"
        bg="purple.500"
        opacity="0.1"
        borderRadius="full"
        zIndex={0}
      />
      
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          justify="space-between"
          gap={{ base: 10, lg: 20 }}
        >
          <VStack
            align={{ base: 'center', lg: 'flex-start' }}
            spacing={5}
            maxW={{ base: '100%', lg: '50%' }}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            <Badge 
              colorScheme="blue" 
              fontSize="md" 
              px={4} 
              py={2} 
              borderRadius="full"
            >
              The Future of Online Learning
            </Badge>
            
            <Heading
              as="h1"
              fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
              fontWeight="bold"
              lineHeight="1.2"
              bgGradient="linear(to-r, blue.600, purple.600)"
              bgClip="text"
            >
              Accelerate Your Career with BitsElevate
            </Heading>
            
            <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600">
              Master in-demand skills with interactive courses taught by world-class 
              instructors. Join over 250,000 students already building their future.
            </Text>
            
            <HStack spacing={4} mt={3}>
              <Button 
                as={Link} 
                to="/register" 
                size="lg" 
                colorScheme="blue" 
                rightIcon={<FaArrowRight />}
                px={8}
              >
                Get Started
              </Button>
              
              <Button 
                as={Link} 
                to="/demo" 
                size="lg" 
                variant="outline" 
                leftIcon={<FaPlay />}
                colorScheme="blue"
              >
                Watch Demo
              </Button>
            </HStack>
            
            <Box mt={8} width="100%">
              <Text fontSize="sm" color="gray.500" mb={3}>
                TRUSTED BY TEAMS AT
              </Text>
              
              <Flex 
                wrap="wrap" 
                justify={{ base: 'center', lg: 'flex-start' }} 
                gap={6}
              >
                {trustedCompanies.map((company, index) => (
                  <Text 
                    key={index} 
                    color="gray.500" 
                    fontWeight="bold" 
                    fontSize="md"
                  >
                    {company}
                  </Text>
                ))}
              </Flex>
            </Box>
          </VStack>
          
          <Box
            w={{ base: '100%', lg: '50%' }}
            position="relative"
          >
            <Image
              src="/images/hero-illustration.svg"
              alt="Students learning online"
              w="100%"
              fallback={
                <Box 
                  height={{ base: "300px", md: "450px" }} 
                  width="100%" 
                  bg="blue.50" 
                  borderRadius="xl" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  border="1px dashed"
                  borderColor="blue.200"
                >
                  <Text color="blue.500" fontSize="xl" fontWeight="bold">
                    Hero Illustration
                  </Text>
                </Box>
              }
            />
            
            {!isMobile && (
              <>
                <Box
                  position="absolute"
                  top="10%"
                  right="5%"
                  bg="white"
                  boxShadow="xl"
                  borderRadius="xl"
                  p={4}
                  maxW="200px"
                  animation="float 6s ease-in-out infinite"
                  sx={{
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-20px)' }
                    }
                  }}
                >
                  <Text fontWeight="bold" color="blue.500">
                    1200+ Courses
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    In 15 different categories
                  </Text>
                </Box>
                
                <Box
                  position="absolute"
                  bottom="15%"
                  left="0"
                  bg="white"
                  boxShadow="xl"
                  borderRadius="xl"
                  p={4}
                  maxW="200px"
                  animation="float 8s ease-in-out infinite 1s"
                  sx={{
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-20px)' }
                    }
                  }}
                >
                  <Text fontWeight="bold" color="green.500">
                    87% Completion Rate
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Higher than industry average
                  </Text>
                </Box>
              </>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Hero; 