import { Box, Container, Flex, Heading, SimpleGrid, Text, Icon, Image } from '@chakra-ui/react';
import { FaGraduationCap, FaUsers, FaLaptopCode, FaCertificate, FaChalkboardTeacher, FaHandshake } from 'react-icons/fa';

interface FeatureProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description }: FeatureProps) => {
  return (
    <Box 
      p={6} 
      borderRadius="lg" 
      bg="white" 
      boxShadow="md" 
      transition="all 0.3s" 
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
    >
      <Flex 
        w="70px" 
        h="70px" 
        bg="blue.500" 
        borderRadius="full" 
        justifyContent="center" 
        alignItems="center" 
        mb={4}
      >
        <Icon as={icon} fontSize="2xl" color="white" />
      </Flex>
      <Heading as="h3" fontSize="xl" fontWeight="bold" mb={3}>
        {title}
      </Heading>
      <Text color="gray.600">
        {description}
      </Text>
    </Box>
  );
};

const WhyChooseUs = () => {
  const features = [
    {
      icon: FaLaptopCode,
      title: "Cutting-Edge Curriculum",
      description: "Our courses are designed by industry experts and updated regularly to keep pace with rapidly evolving technologies and market demands."
    },
    {
      icon: FaChalkboardTeacher,
      title: "Expert Instructors",
      description: "Learn from professionals with real-world experience who bring practical insights and mentorship to your educational journey."
    },
    {
      icon: FaUsers,
      title: "Vibrant Community",
      description: "Join a supportive network of peers, mentors, and alumni who collaborate, share resources, and help each other succeed."
    },
    {
      icon: FaGraduationCap,
      title: "Flexible Learning Paths",
      description: "Choose how you learn with self-paced options, live sessions, and hybrid programs designed to fit your schedule and learning style."
    },
    {
      icon: FaHandshake,
      title: "Industry Partnerships",
      description: "Benefit from our connections with leading companies through exclusive internships, job placements, and networking opportunities."
    },
    {
      icon: FaCertificate,
      title: "Recognized Certification",
      description: "Earn credentials that employers trust and value, showcasing your skills and commitment to professional growth."
    }
  ];

  return (
    <Box py={16} bg="gray.50">
      <Container maxW="container.xl">
        <Flex 
          direction={{ base: "column", lg: "row" }} 
          align="center" 
          justify="space-between"
        >
          <Box 
            flex={1} 
            pr={{ base: 0, lg: 12 }} 
            mb={{ base: 10, lg: 0 }}
            maxW={{ base: "100%", lg: "40%" }}
          >
            <Heading 
              as="h2" 
              fontSize={{ base: "3xl", md: "4xl" }} 
              fontWeight="bold" 
              lineHeight="shorter" 
              mb={6}
              position="relative"
              _after={{
                content: '""',
                display: 'block',
                width: '80px',
                height: '4px',
                bg: 'blue.500',
                mt: 3
              }}
            >
              Why Choose BitsElevate?
            </Heading>
            <Text fontSize="lg" color="gray.700" mb={6}>
              At BitsElevate, we're committed to transforming education through technology, 
              accessibility, and excellence. Our platform offers more than just courses—it 
              provides a complete ecosystem for your professional growth.
            </Text>
            <Image 
              src="/images/why-choose-us.svg" 
              alt="Learning Experience" 
              maxW="100%" 
              fallback={
                <Box 
                  height="300px" 
                  width="100%" 
                  bg="blue.100" 
                  borderRadius="lg" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Text color="blue.500" fontSize="xl" fontWeight="bold">Learning Experience Image</Text>
                </Box>
              }
            />
          </Box>

          <Box flex={1.5}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {features.map((feature, index) => (
                <Feature 
                  key={index} 
                  icon={feature.icon} 
                  title={feature.title} 
                  description={feature.description} 
                />
              ))}
            </SimpleGrid>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default WhyChooseUs; 