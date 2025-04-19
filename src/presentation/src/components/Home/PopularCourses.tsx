import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Flex, 
  Heading, 
  SimpleGrid, 
  Text, 
  Badge, 
  Image, 
  HStack, 
  Icon,
  useBreakpointValue
} from '@chakra-ui/react';
import { FaStar, FaUsers, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface CourseProps {
  id: string;
  title: string;
  instructor: string;
  image: string;
  rating: number;
  students: number;
  duration: string;
  level: string;
  price: number;
  discountPrice?: number;
  category: string;
}

const Course = ({ 
  title, 
  instructor, 
  image, 
  rating, 
  students, 
  duration, 
  level, 
  price, 
  discountPrice, 
  category 
}: CourseProps) => {
  return (
    <Box 
      borderRadius="lg" 
      overflow="hidden" 
      bg="white" 
      boxShadow="md"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-8px)', boxShadow: 'xl' }}
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <Box position="relative">
        <Image 
          src={image} 
          alt={title} 
          w="100%" 
          h="200px" 
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/300x200?text=Course+Image"
        />
        <Badge 
          position="absolute" 
          top="3" 
          right="3" 
          colorScheme="blue" 
          borderRadius="full" 
          px="3" 
          py="1"
        >
          {category}
        </Badge>
        {discountPrice && (
          <Badge 
            position="absolute" 
            top="3" 
            left="3" 
            colorScheme="red" 
            borderRadius="full" 
            px="3" 
            py="1"
          >
            {Math.round(((price - discountPrice) / price) * 100)}% OFF
          </Badge>
        )}
      </Box>
      
      <Flex direction="column" flex="1" p="5">
        <Heading as="h3" fontSize="xl" mb="2" noOfLines={2}>
          {title}
        </Heading>
        
        <Text color="gray.600" fontSize="sm" mb="3">
          by {instructor}
        </Text>
        
        <HStack mb="3" spacing="2">
          <Badge colorScheme="yellow" display="flex" alignItems="center">
            <Icon as={FaStar} mr="1" />
            {rating.toFixed(1)}
          </Badge>
          
          <Badge colorScheme="purple" display="flex" alignItems="center">
            <Icon as={FaUsers} mr="1" />
            {students.toLocaleString()}
          </Badge>
          
          <Badge colorScheme="green">
            {level}
          </Badge>
        </HStack>
        
        <HStack mb="4">
          <Icon as={FaClock} color="gray.500" />
          <Text fontSize="sm" color="gray.600">{duration}</Text>
        </HStack>
        
        <Flex mt="auto" alignItems="center" justifyContent="space-between">
          <Box>
            {discountPrice ? (
              <Flex alignItems="baseline">
                <Text fontWeight="bold" fontSize="xl" color="blue.600">
                  ${discountPrice}
                </Text>
                <Text as="s" fontSize="sm" color="gray.500" ml="2">
                  ${price}
                </Text>
              </Flex>
            ) : (
              <Text fontWeight="bold" fontSize="xl" color="blue.600">
                ${price}
              </Text>
            )}
          </Box>
          
          <Button colorScheme="blue" size="sm">
            View Course
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

const PopularCourses = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const coursesPerPage = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 3 });
  
  const courses: CourseProps[] = [
    {
      id: "1",
      title: "Complete Web Development Bootcamp",
      instructor: "Dr. Sarah Johnson",
      image: "/images/courses/web-dev.jpg",
      rating: 4.8,
      students: 15420,
      duration: "10 weeks",
      level: "Beginner",
      price: 149.99,
      discountPrice: 99.99,
      category: "Web Development"
    },
    {
      id: "2",
      title: "Machine Learning & Data Science Fundamentals",
      instructor: "Prof. Michael Chen",
      image: "/images/courses/data-science.jpg",
      rating: 4.9,
      students: 12350,
      duration: "12 weeks",
      level: "Intermediate",
      price: 199.99,
      discountPrice: 149.99,
      category: "Data Science"
    },
    {
      id: "3",
      title: "iOS App Development with Swift",
      instructor: "Alex Williams",
      image: "/images/courses/ios-dev.jpg",
      rating: 4.7,
      students: 8730,
      duration: "8 weeks",
      level: "Intermediate",
      price: 129.99,
      category: "Mobile Development"
    },
    {
      id: "4",
      title: "DevOps Engineering & Cloud Infrastructure",
      instructor: "Emily Rodriguez",
      image: "/images/courses/devops.jpg",
      rating: 4.6,
      students: 6280,
      duration: "8 weeks",
      level: "Advanced",
      price: 179.99,
      category: "DevOps"
    },
    {
      id: "5",
      title: "Cybersecurity: Ethical Hacking & Network Defense",
      instructor: "Dr. James Wilson",
      image: "/images/courses/cybersecurity.jpg",
      rating: 4.9,
      students: 9840,
      duration: "10 weeks",
      level: "Intermediate",
      price: 189.99,
      discountPrice: 139.99,
      category: "Cybersecurity"
    },
    {
      id: "6",
      title: "UI/UX Design Masterclass",
      instructor: "Sophia Martinez",
      image: "/images/courses/ui-ux.jpg",
      rating: 4.8,
      students: 7650,
      duration: "6 weeks",
      level: "All Levels",
      price: 129.99,
      discountPrice: 89.99,
      category: "Design"
    }
  ];
  
  const totalPages = Math.ceil(courses.length / (coursesPerPage || 3));
  
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  
  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  const startIndex = currentPage * (coursesPerPage || 3);
  const visibleCourses = courses.slice(startIndex, startIndex + (coursesPerPage || 3));
  
  return (
    <Box py={16} bg="gray.50">
      <Container maxW="container.xl">
        <Flex justifyContent="space-between" alignItems="center" mb={10}>
          <Box>
            <Heading 
              as="h2" 
              fontSize={{ base: "3xl", md: "4xl" }} 
              fontWeight="bold"
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
              Popular Courses
            </Heading>
            <Text color="gray.600" mt={4} fontSize="lg">
              Explore our most in-demand courses and start your learning journey today.
            </Text>
          </Box>
          
          <Flex display={{ base: "none", md: "flex" }}>
            <Button 
              leftIcon={<FaChevronLeft />}
              onClick={prevPage}
              disabled={currentPage === 0}
              mr={2}
              aria-label="Previous page"
            >
              Prev
            </Button>
            <Button 
              rightIcon={<FaChevronRight />}
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              aria-label="Next page"
            >
              Next
            </Button>
          </Flex>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={8}>
          {visibleCourses.map((course) => (
            <Course key={course.id} {...course} />
          ))}
        </SimpleGrid>
        
        <Flex justifyContent="center" mt={10} display={{ base: "flex", md: "none" }}>
          <Button 
            leftIcon={<FaChevronLeft />}
            onClick={prevPage}
            disabled={currentPage === 0}
            mr={4}
            aria-label="Previous page"
          >
            Prev
          </Button>
          <Button 
            rightIcon={<FaChevronRight />}
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            aria-label="Next page"
          >
            Next
          </Button>
        </Flex>
        
        <Flex justifyContent="center" mt={12}>
          <Button size="lg" colorScheme="blue">
            View All Courses
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};

export default PopularCourses; 