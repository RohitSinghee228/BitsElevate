import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Avatar,
  Icon,
  Button,
  useBreakpointValue,
  Fade,
  HStack
} from '@chakra-ui/react';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface TestimonialProps {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  course: string;
}

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const testimonialToShow = useBreakpointValue({ base: 1, md: 2, lg: 3 }) || 1;
  
  const testimonials: TestimonialProps[] = [
    {
      id: "1",
      name: "Emily Johnson",
      role: "Software Developer",
      avatar: "/images/testimonials/emily.jpg",
      content: "EduPulse completely transformed my career path. The web development bootcamp was comprehensive and practical. I landed a job as a junior developer within a month of completing the course!",
      rating: 5,
      course: "Web Development Bootcamp"
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Data Analyst",
      avatar: "/images/testimonials/michael.jpg",
      content: "The Data Science course exceeded all my expectations. The instructors were knowledgeable and always available to help. The projects were challenging but extremely rewarding.",
      rating: 5,
      course: "Data Science Fundamentals"
    },
    {
      id: "3",
      name: "Sophia Rodriguez",
      role: "UX Designer",
      avatar: "/images/testimonials/sophia.jpg",
      content: "As someone transitioning into tech from a different field, the UI/UX Design Masterclass gave me all the tools and confidence I needed. The portfolio projects helped me secure my first design role.",
      rating: 4,
      course: "UI/UX Design Masterclass"
    },
    {
      id: "4",
      name: "David Kim",
      role: "Mobile Developer",
      avatar: "/images/testimonials/david.jpg",
      content: "The iOS Development course was fantastic! The curriculum was up-to-date with the latest Swift features, and the hands-on approach made learning enjoyable and effective.",
      rating: 5,
      course: "iOS App Development"
    },
    {
      id: "5",
      name: "Aisha Patel",
      role: "Cybersecurity Analyst",
      avatar: "/images/testimonials/aisha.jpg",
      content: "The Cybersecurity course provided deep insights into network defense strategies. The lab environments were realistic, and the instructors brought real-world experience to the classroom.",
      rating: 5,
      course: "Cybersecurity Fundamentals"
    },
    {
      id: "6",
      name: "James Wilson",
      role: "DevOps Engineer",
      avatar: "/images/testimonials/james.jpg",
      content: "I was looking to upgrade my skills in cloud infrastructure, and EduPulse delivered exactly what I needed. The course was challenging but well-structured, with excellent support.",
      rating: 4,
      course: "DevOps Engineering"
    }
  ];
  
  const totalTestimonials = testimonials.length;
  
  const nextTestimonial = () => {
    setIsChanging(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % (totalTestimonials - (testimonialToShow - 1)));
      setIsChanging(false);
    }, 200);
  };
  
  const prevTestimonial = () => {
    setIsChanging(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? totalTestimonials - testimonialToShow : prevIndex - 1
      );
      setIsChanging(false);
    }, 200);
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 8000);
    
    return () => clearInterval(interval);
  }, [currentIndex, testimonialToShow]);
  
  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + testimonialToShow
  );
  
  const renderStars = (rating: number) => {
    return (
      <HStack spacing={1} mt={2}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            as={FaStar}
            color={i < rating ? "yellow.400" : "gray.300"}
            fontSize="md"
          />
        ))}
      </HStack>
    );
  };
  
  return (
    <Box py={16} bg="blue.50">
      <Container maxW="container.xl">
        <Flex direction="column" align="center" mb={12}>
          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="bold"
            textAlign="center"
            mb={3}
          >
            What Our Students Say
          </Heading>
          <Text 
            color="gray.600" 
            fontSize="lg" 
            textAlign="center"
            maxW="2xl"
          >
            Hear from our students about how EduPulse helped them achieve their learning goals and advance their careers.
          </Text>
        </Flex>
        
        <Fade in={!isChanging} transition={{ enter: { duration: 0.3 } }}>
          <Flex 
            direction={{ base: "column", md: testimonialToShow > 1 ? "row" : "column" }}
            justify="center"
            align="stretch"
            wrap="wrap"
            gap={8}
          >
            {visibleTestimonials.map((testimonial) => (
              <Box
                key={testimonial.id}
                bg="white"
                borderRadius="lg"
                boxShadow="md"
                p={8}
                position="relative"
                flex={`0 1 calc(${100 / testimonialToShow}% - 2rem)`}
                minW={{ base: "100%", md: testimonialToShow > 1 ? "45%" : "100%" }}
                transition="all 0.3s"
                _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
              >
                <Icon
                  as={FaQuoteLeft}
                  fontSize="3xl"
                  color="blue.100"
                  position="absolute"
                  top={4}
                  left={4}
                />
                
                <Text fontSize="md" mt={8} mb={6} color="gray.700">
                  {testimonial.content}
                </Text>
                
                <Flex justify="space-between" align="center">
                  <Flex align="center">
                    <Avatar
                      size="md"
                      name={testimonial.name}
                      src={testimonial.avatar}
                      mr={4}
                      border="2px solid"
                      borderColor="blue.500"
                    />
                    <Box>
                      <Text fontWeight="bold">{testimonial.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {testimonial.role}
                      </Text>
                      <Text fontSize="xs" color="blue.500" mt={1}>
                        {testimonial.course}
                      </Text>
                      {renderStars(testimonial.rating)}
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Fade>
        
        <Flex justify="center" mt={10}>
          <Button
            onClick={prevTestimonial}
            leftIcon={<FaChevronLeft />}
            mr={4}
            aria-label="Previous testimonial"
            isDisabled={currentIndex === 0}
          >
            Prev
          </Button>
          <Button
            onClick={nextTestimonial}
            rightIcon={<FaChevronRight />}
            aria-label="Next testimonial"
            isDisabled={currentIndex >= totalTestimonials - testimonialToShow}
          >
            Next
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};

export default Testimonials; 