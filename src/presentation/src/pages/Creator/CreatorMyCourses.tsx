import { Box, Button, Flex, Grid, Heading, Image, Input, InputGroup, InputLeftElement, Spinner, Text, VStack, useToast } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';

import { FaSearch } from 'react-icons/fa';
import { UserContext } from '../../UserContext';
import axios from 'axios';

interface Course {
  _id: string;
  name: string;
  title: string;
  description: string;
  overview?: string;
  price: number;
  img: string;
  studentsEnrolled?: string[];
  instructor?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export default function CreatorMyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(UserContext);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreatorCourses = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("No authentication token found");
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        // Try to get user ID either from context or token
        let userId = null;
        
        if (user && user.id) {
          console.log("Using user ID from context:", user.id);
          userId = user.id;
        } else {
          console.log("User context missing or incomplete:", user);
          
          // Try to extract user info from JWT token (simplified approach)
          try {
            // Try to verify token and get user info
            const verifyResponse = await axios.get('http://localhost:3001/api/users/auth/verify', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (verifyResponse.data && verifyResponse.data.user && verifyResponse.data.user.id) {
              console.log("Retrieved user ID from token verification:", verifyResponse.data.user.id);
              userId = verifyResponse.data.user.id;
            }
          } catch (tokenError) {
            console.error("Failed to verify token:", tokenError);
          }
        }
        
        if (!userId) {
          setError("User information not available. Please log in again.");
          setLoading(false);
          return;
        }

        // Now fetch courses for this user ID
        console.log(`Fetching courses for instructor ID: ${userId}`);
        
        // First try the instructor endpoint
        try {
          const response = await axios.get(`http://localhost:3001/api/courses/courseManagement/instructor/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          let coursesData = response.data;
          if (response.data && response.data.data) {
            coursesData = response.data.data;
          }
          
          if (Array.isArray(coursesData)) {
            console.log(`Found ${coursesData.length} courses for instructor`);
            setCourses(coursesData);
            setFilteredCourses(coursesData);
          } else {
            console.warn("Response is not an array:", coursesData);
            setCourses([]);
            setFilteredCourses([]);
          }
        } catch (instructorError) {
          console.error("Error fetching by instructor:", instructorError);
          
          // Fallback to all courses and filter
          try {
            console.log("Trying fallback: fetching all courses");
            const allCoursesResponse = await axios.get(`http://localhost:3001/api/courses/courseManagement/getAll`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            let allCourses = allCoursesResponse.data;
            if (allCoursesResponse.data && allCoursesResponse.data.data) {
              allCourses = allCoursesResponse.data.data;
            }
            
            if (Array.isArray(allCourses)) {
              const creatorCourses = allCourses.filter(course => {
                if (!course.instructor) return false;
                
                const instructorId = typeof course.instructor === 'string'
                  ? course.instructor
                  : course.instructor._id;
                  
                return instructorId === userId;
              });
              
              console.log(`Filtered ${creatorCourses.length} courses from ${allCourses.length} total courses`);
              setCourses(creatorCourses);
              setFilteredCourses(creatorCourses);
              
              if (creatorCourses.length === 0) {
                toast({
                  title: "No courses found",
                  description: "You haven't created any courses yet.",
                  status: "info",
                  duration: 5000,
                  isClosable: true
                });
              }
            } else {
              console.warn("All courses response is not an array");
              setCourses([]);
              setFilteredCourses([]);
            }
          } catch (fallbackError) {
            console.error("Fallback approach also failed:", fallbackError);
            throw instructorError; // Re-throw the original error
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch courses:", error);
        
        if (error.response && error.response.status === 401) {
          // Auth error - token expired
          localStorage.removeItem('token'); // Clear invalid token
          setError("Your session has expired. Please log in again.");
        } else {
          setError(
            error.response?.data?.message || 
            "Failed to load courses. Please try again later."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorCourses();
  }, [user, toast]);

  // Add search filter effect
  useEffect(() => {
    if (courses) {
      const filtered = courses.filter(course => 
        (course.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (course.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (course.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/courses/courseManagement/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove the course from both state arrays
      const updatedCourses = courses.filter(course => course._id !== courseId);
      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses.filter(course => 
        (course.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (course.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (course.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      ));
      
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the course. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLoginRedirect = () => {
    // Save current path to redirect back after login
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/sign-in');
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" thickness="4px" color="blue.500" />
        <Text mt={4}>Loading your courses...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Heading as="h2" size="xl" color="red.500">
          Error
        </Heading>
        <Text mt={4}>{error}</Text>
        <Flex mt={6} justifyContent="center" gap={4}>
          <Button 
            colorScheme="blue" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
          {(error.includes("log in") || error.includes("token") || error.includes("authentication") || error.includes("session")) && (
            <Button 
              colorScheme="green" 
              onClick={handleLoginRedirect}
            >
              Log In
            </Button>
          )}
        </Flex>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Flex direction={{ base: "column", md: "row" }} justifyContent="space-between" alignItems={{ base: "start", md: "center" }} mb={6} gap={4}>
        <Heading as="h1" size="xl" color="gray.700" whiteSpace="nowrap">
          My Courses
        </Heading>
        
        <InputGroup maxW={{ base: "100%", md: "400px" }}>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search your courses..." 
            value={searchQuery}
            onChange={handleSearch}
            borderRadius="md"
          />
        </InputGroup>
        
        <Button as={Link} to="/creator/create-new-course" colorScheme="blue" whiteSpace="nowrap">
          Create New Course
        </Button>
      </Flex>

      {filteredCourses.length === 0 ? (
        <Box textAlign="center" py={10} bg="gray.50" borderRadius="lg">
          {courses.length === 0 ? (
            <>
              <Text fontSize="xl" mb={4}>You haven't created any courses yet.</Text>
              <Link to="/creator/create-new-course">
                <Button colorScheme="blue">
                  Create Your First Course
                </Button>
              </Link>
            </>
          ) : (
            <Text fontSize="xl" mb={4}>No courses match your search.</Text>
          )}
        </Box>
      ) : (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
          {filteredCourses.map((course) => (
            <Box
              key={course._id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              bg="white"
              shadow="md"
              transition="all 0.3s"
              _hover={{ shadow: "lg", transform: "translateY(-5px)" }}
            >
              <Image
                src={course.img || "https://placehold.co/600x400?text=No+Image"}
                alt={course.name || course.title}
                height="200px"
                width="100%"
                objectFit="cover"
                fallbackSrc="https://placehold.co/600x400?text=No+Image"
              />
              
              <VStack p={5} align="start" spacing={2}>
                <Heading as="h3" size="md" noOfLines={1}>
                  {course.name || course.title}
                </Heading>
                
                <Text color="gray.600" noOfLines={2}>
                  {course.overview || course.description || "No description available"}
                </Text>
                
                <Flex width="100%" justifyContent="space-between" mt={2}>
                  <Text fontWeight="bold" color="blue.600">
                    ₹{typeof course.price === 'number' ? course.price.toFixed(2) : course.price}
                  </Text>
                  <Text color="gray.600">
                    {course.studentsEnrolled ? `${course.studentsEnrolled.length} students` : '0 students'}
                  </Text>
                </Flex>
                
                <Flex width="100%" mt={3} justifyContent="space-between">
                  <Button
                    as={Link}
                    to={`/courses/${course._id}`}
                    colorScheme="blue"
                    size="sm"
                    width="48%"
                  >
                    View
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    width="48%"
                    onClick={() => handleDeleteCourse(course._id)}
                  >
                    Delete
                  </Button>
                </Flex>
              </VStack>
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
}
