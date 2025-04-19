import { Box, Button, Flex, Grid, Heading, Image, Spinner, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { getCachedEnrollmentStatus, refreshEnrollmentStatus } from "../../../utils/enrollmentUtils";
import { useContext, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import CourseAbsolute from "./CourseAbsolute";
import { UserContext } from "../../../UserContext";

interface CourseData {
  price: number;
  img: string;
  _id: string;
  name: string;
  duration: string;
  overview: string;
  author: {
    firstName: string;
    lastName: string;
  };
  language: string;
  summary: string[];
  createdBy: {
    firstName: string;
    lastName: string;
  };
  courseContent?: Array<{
    videoLink: string;
    instructions: string[];
  }>;
}

interface EnrollmentData {
  _id: string;
  userId: string;
  courseId: {
    _id: string;
    name: string;
    courseContent: Array<{
      videoLink: string;
      instructions: string[];
    }>;
  };
  currentStep: number;
  completed: boolean;
}

const CoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [courseData, setCourseData] = useState<CourseData>({
    price: 0,
    img: '',
    _id: '',
    name: '',
    duration: '',
    overview: '',
    author: {
      firstName: '',
      lastName: ''
    },
    language: '',
    summary: [],
    createdBy: {
      firstName: '',
      lastName: ''
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Fetch course data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/courses/courseManagement/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        console.log("Course data:", data);
        setCourseData(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Check if user is enrolled in this course
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user?.id || !id) return;
      
      try {
        console.log("Checking enrollment for user:", user.id, "course:", id);
        
        // Use the cached enrollment status with auto-refresh
        const isUserEnrolled = await getCachedEnrollmentStatus(user.id, id);
        console.log("Enrollment status from cache/API:", isUserEnrolled);
        
        if (isUserEnrolled) {
          // If enrolled, get full enrollment data
          const response = await fetch(
            `http://localhost:3001/api/courses/courseManagement/enrolledCourses/${user.id}/${id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Full enrollment data:", data);
            
            if (data.data) {
              setIsEnrolled(true);
              setEnrollmentData(data.data);
              // Set active video to current progress
              if (data.data.currentStep !== undefined) {
                setActiveVideoIndex(data.data.currentStep);
              }
            }
          }
        } else {
          // Not enrolled
          setIsEnrolled(false);
          setEnrollmentData(null);
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
        setIsEnrolled(false);
        setEnrollmentData(null);
      }
    };

    // Check enrollment, and if URL has a 'payment_complete' param, force refresh
    const checkAndRefreshEnrollment = async () => {
      const urlParams = new URLSearchParams(location.search);
      if (urlParams.get('payment_complete') === 'true' && user?.id && id) {
        console.log("Payment completed, forcing enrollment refresh");
        const isUserEnrolled = await refreshEnrollmentStatus(user.id, id);
        if (isUserEnrolled) {
          setIsEnrolled(true);
        }
      }
      
      checkEnrollment();
    };

    checkAndRefreshEnrollment();
  }, [user?.id, id, location]);

  const handleVideoSelect = (index: number) => {
    setActiveVideoIndex(index);
    // If enrolled, save progress
    if (isEnrolled && user?.id && id) {
      saveProgress(index);
    }
  };

  const saveProgress = async (step: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/courses/courseManagement/saveProgress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: user?.id,
            courseId: id,
            step: step,
          }),
        }
      );
      console.log("Progress saved:", response);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleCompleteVideo = async () => {
    if (!isEnrolled || !user?.id || !id) return;
    
    // If this is the last video, mark course as completed
    if (activeVideoIndex === (courseData.courseContent?.length || 0) - 1) {
      try {
        const response = await fetch(
          `http://localhost:3001/api/courses/courseManagement/completedCourse`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              userId: user.id,
              courseId: id,
            }),
          }
        );
        console.log("Course completed:", response);
      } catch (error) {
        console.error("Error marking course as completed:", error);
      }
    } else {
      // Go to next video
      const nextIndex = activeVideoIndex + 1;
      setActiveVideoIndex(nextIndex);
      saveProgress(nextIndex);
    }
  };

  if (loading) {
    return (
      <Flex height="80vh" width="100%" justify="center" align="center">
        <Spinner size="xl" thickness="4px" color="blue.500" />
      </Flex>
    );
  }

  const props = {
    onOpen: () => {}, // Placeholder function
    price: courseData.price,
    img: courseData.img,
    _id: courseData._id,
    name: courseData.name,
    duration: courseData.duration,
    isEnrolled: isEnrolled
  };

  // Get active video
  const currentContent = courseData.courseContent?.[activeVideoIndex];
  const videoId = currentContent?.videoLink ? currentContent.videoLink.split("=")[1] : null;

  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      {/* Course Header */}
      <Box bg="blue.700" color="white" py={8} px={4} mb={8}>
        <Flex 
          direction={{ base: "column", md: "row" }} 
          maxW="1200px" 
          mx="auto"
          align={{ base: "center", md: "flex-start" }}
          justify="space-between"
        >
          <Box maxW={{ base: "100%", md: "60%" }} mb={{ base: 6, md: 0 }}>
            <Heading as="h1" size="xl" mb={3}>
              {courseData.name}
            </Heading>
            <Text fontSize="lg" fontWeight="normal" mb={4} opacity={0.9}>
              {courseData.overview}
            </Text>
            <Flex align="center" mt={2} wrap="wrap" gap={4}>
              <Flex align="center">
                <Box as="span" mr={2}>👨‍🏫</Box>
                <Text fontSize="sm">
                  Instructor: {courseData.author?.firstName || 'Unknown'} {courseData.author?.lastName || ''}
                </Text>
              </Flex>
              <Flex align="center">
                <Box as="span" mr={2}>⏱️</Box>
                <Text fontSize="sm">Duration: {courseData.duration} min</Text>
              </Flex>
              <Flex align="center">
                <Box as="span" mr={2}>🌐</Box>
                <Text fontSize="sm">Language: {courseData.language}</Text>
              </Flex>
            </Flex>
          </Box>
          <Box maxW={{ base: "300px", md: "300px" }} borderRadius="md" overflow="hidden">
            <Image 
              src={courseData.img || "https://placehold.co/300x150?text=Course+Image"} 
              alt={courseData.name}
              objectFit="cover"
              width="100%"
              height="auto"
              fallbackSrc="https://placehold.co/300x150?text=No+Image+Available"
            />
          </Box>
        </Flex>
      </Box>

      {isEnrolled && courseData.courseContent && courseData.courseContent.length > 0 ? (
        // Course Content - Enrolled User View
        <Grid 
          templateColumns={{ base: "1fr", md: "300px 1fr" }} 
          gap={6}
          maxW="1200px"
          mx="auto"
          px={4}
        >
          {/* Video Sidebar */}
          <Box 
            bg={bgColor} 
            borderRadius="md" 
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
            height="fit-content"
            position="sticky"
            top="20px"
          >
            <Box bg="blue.600" color="white" py={3} px={4}>
              <Heading size="md">Course Content</Heading>
            </Box>
            <VStack spacing={0} align="stretch" maxH="600px" overflowY="auto">
              {courseData.courseContent.map((content, idx) => (
                <Box 
                  key={idx}
                  py={3}
                  px={4}
                  borderBottomWidth="1px"
                  borderColor={borderColor}
                  bg={idx === activeVideoIndex ? "blue.50" : "transparent"}
                  cursor="pointer"
                  onClick={() => handleVideoSelect(idx)}
                  _hover={{ bg: "blue.50" }}
                >
                  <Flex align="center">
                    <Box 
                      w="24px" 
                      h="24px" 
                      borderRadius="full" 
                      bg={idx === activeVideoIndex ? "blue.500" : "gray.200"}
                      color="white"
                      fontSize="xs"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mr={3}
                    >
                      {idx + 1}
                    </Box>
                    <Text fontWeight={idx === activeVideoIndex ? "bold" : "normal"}>
                      Video {idx + 1}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Video Player & Content */}
          <Box 
            bg={bgColor} 
            borderRadius="md" 
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            {videoId ? (
              <Box position="relative" pb="56.25%" height="0" overflow="hidden">
                <iframe
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: 0
                  }}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Course Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </Box>
            ) : (
              <Box bg="gray.100" height="400px" display="flex" alignItems="center" justifyContent="center">
                <Text color="gray.500">No video available for this course</Text>
              </Box>
            )}

            <Box p={6}>
              <Heading size="md" mb={4}>
                {currentContent ? `Video ${activeVideoIndex + 1}` : 'Course Content'}
              </Heading>
              
              {currentContent?.instructions && currentContent.instructions.length > 0 && (
                <Box mb={6}>
                  <Heading size="sm" mb={2}>Instructions:</Heading>
                  <VStack align="start" spacing={2}>
                    {currentContent.instructions.map((instruction, idx) => (
                      <Flex key={idx}>
                        <Text fontSize="xl" color="blue.500" mr={2}>•</Text>
                        <Text>{instruction}</Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}
              
              <Flex justify="space-between" mt={6}>
                <Button 
                  colorScheme="blue" 
                  variant="outline"
                  onClick={() => handleVideoSelect(Math.max(0, activeVideoIndex - 1))}
                  isDisabled={activeVideoIndex === 0}
                >
                  Previous
                </Button>
                <Button 
                  colorScheme="blue"
                  onClick={handleCompleteVideo}
                >
                  {activeVideoIndex === (courseData.courseContent.length - 1) ? "Complete Course" : "Next Video"}
                </Button>
              </Flex>
            </Box>
          </Box>
        </Grid>
      ) : !isEnrolled ? (
        // Not enrolled view
        <Box maxW="1200px" mx="auto" px={4}>
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
            <Box>
              {/* Course Details */}
              <Box 
                bg={bgColor} 
                borderRadius="md" 
                borderWidth="1px"
                borderColor={borderColor}
                p={6}
                mb={6}
              >
                <Heading size="md" mb={4}>About this course</Heading>
                <Text mb={6}>{courseData.overview}</Text>
                
                {courseData.summary && courseData.summary.length > 0 && (
                  <Box mb={6}>
                    <Heading size="sm" mb={3}>What you'll learn:</Heading>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                      {courseData.summary.map((item, idx) => (
                        <Flex key={idx} align="center">
                          <Box as="span" mr={2} color="green.500">✓</Box>
                          <Text>{item}</Text>
                        </Flex>
                      ))}
                    </Grid>
                  </Box>
                )}
                
                <Heading size="sm" mb={3}>Course details:</Heading>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                  <Flex align="center">
                    <Box as="span" mr={2}>🕐</Box>
                    <Text>Duration: {courseData.duration} minutes</Text>
                  </Flex>
                  <Flex align="center">
                    <Box as="span" mr={2}>🌐</Box>
                    <Text>Language: {courseData.language}</Text>
                  </Flex>
                  <Flex align="center">
                    <Box as="span" mr={2}>🧑‍🏫</Box>
                    <Text>Instructor: {courseData.author?.firstName || 'Unknown'} {courseData.author?.lastName || ''}</Text>
                  </Flex>
                </Grid>
              </Box>
              
              {/* Preview Video */}
              {videoId && (
                <Box 
                  bg={bgColor} 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={borderColor}
                  overflow="hidden"
                  mb={6}
                >
                  <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
                    <Heading size="md">Course Preview</Heading>
                  </Box>
                  <Box position="relative" pb="56.25%" height="0" overflow="hidden">
                    <iframe
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: 0
                      }}
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="Course Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </Box>
                </Box>
              )}
            </Box>
            
            {/* Enrollment Card */}
            <Box 
              display={{ base: "block", md: "block" }}
              position={{ base: "relative", md: "sticky" }}
              top="20px"
              height="fit-content"
            >
              <CourseAbsolute {...props} />
            </Box>
          </Grid>
        </Box>
      ) : (
        // No course content
        <Box maxW="1200px" mx="auto" px={4} textAlign="center" py={10}>
          <Heading size="md" mb={4} color="gray.600">
            This course doesn't have any content yet.
          </Heading>
          <Text>Check back later for updates.</Text>
        </Box>
      )}
    </Box>
  );
};

export default CoursePage;

