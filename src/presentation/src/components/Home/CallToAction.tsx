import React from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Image,
  useBreakpointValue
} from '@chakra-ui/react';
import { FaGraduationCap, FaLaptopCode, FaUserGraduate, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const isSmallScreen = useBreakpointValue({ base: true, md: false });
  
  const stats = [
    {
      icon: FaUserGraduate,
      value: '250K+',
      label: 'Enrolled Students'
    },
    {
      icon: FaLaptopCode,
      value: '500+',
      label: 'Expert Instructors'
    },
    {
      icon: FaGraduationCap,
      value: '1200+',
      label: 'Courses Available'
    }
  ];

  return (
    <Box py={16} position="relative" overflow="hidden">
      {/* Background gradient */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="linear(to-r, blue.600, purple.600)"
        opacity={0.95}
        zIndex={-1}
      />
      
      {/* Background pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundImage="url('/images/pattern-dots.svg')"
        backgroundSize="30px"
        opacity={0.1}
        zIndex={-1}
      />
      
      <Container maxW="container.xl">
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          justify="space-between"
          gap={{ base: 10, lg: 20 }}
        >
          <VStack
            align={{ base: 'center', lg: 'flex-start' }}
            spacing={6}
            maxW={{ base: '100%', lg: '50%' }}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            <Heading
              as="h2"
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="bold"
              color="white"
              lineHeight="1.2"
            >
              Transform Your Future with EduPulse
            </Heading>
            
            <Text fontSize={{ base: 'lg', md: 'xl' }} color="white" opacity={0.9}>
              Join thousands of learners worldwide who are advancing their careers, 
              acquiring new skills, and achieving their educational goals with EduPulse's 
              cutting-edge learning platform.
            </Text>
            
            <HStack 
              spacing={8} 
              mt={4} 
              justify={{ base: 'center', lg: 'flex-start' }}
              width="100%"
              flexWrap="wrap"
            >
              {stats.map((stat, index) => (
                <VStack key={index} spacing={1}>
                  <Icon as={stat.icon} color="yellow.300" fontSize="2xl" />
                  <Text color="white" fontSize="2xl" fontWeight="bold">
                    {stat.value}
                  </Text>
                  <Text color="white" opacity={0.8} fontSize="sm">
                    {stat.label}
                  </Text>
                </VStack>
              ))}
            </HStack>
            
            <HStack spacing={4} mt={4}>
              <Button 
                as={Link} 
                to="/register" 
                size="lg" 
                bg="white" 
                color="blue.600"
                _hover={{ bg: 'gray.100' }}
                rightIcon={<FaArrowRight />}
                px={8}
              >
                Get Started
              </Button>
              
              <Button 
                as={Link} 
                to="/courses" 
                size="lg" 
                variant="outline" 
                color="white"
                borderColor="white"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                Browse Courses
              </Button>
            </HStack>
          </VStack>
          
          <Box
            maxW={{ base: '100%', lg: '45%' }}
            display={{ base: 'none', md: 'block' }}
          >
            <Image
              src="/images/cta-illustration.svg"
              alt="Students learning online"
              w="100%"
              maxH="400px"
              fallback={
                <Box 
                  height="400px" 
                  width="100%" 
                  bg="whiteAlpha.300" 
                  borderRadius="lg" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Text color="white" fontSize="xl" fontWeight="bold">Learning Illustration</Text>
                </Box>
              }
            />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default CallToAction; 