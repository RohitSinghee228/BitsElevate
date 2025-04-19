import { Box, Button, Container, Flex, Grid, Heading, Image, Spinner, Text, VStack, useColorModeValue, useToast } from '@chakra-ui/react';
import { ENDPOINTS, getAuthHeader } from "../utils/apiConfig";
import { formatCertificateDate, generateCertificatePDF } from '../utils/certificateUtils';
import { getCachedEnrollmentStatus, refreshEnrollmentStatus } from "../utils/enrollmentUtils";
import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { UserContext } from "../UserContext";
import axios from 'axios';

interface Lesson {
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
}

interface Course {
  _id: string;
  title: string;
  name: string;
  description: string;
  overview: string;
  price: number;
  duration: number;
  category: string;
  level: string;
  img: string;
  language: string;
  author: {
    firstName: string;
    lastName: string;
  };
  summary: string[];
  courseContent?: Array<{
    videoLink: string;
    instructions: string[];
  }>;
  lessons: Lesson[];
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function CourseData() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError("Course ID is undefined");
          setLoading(false);
          return;
        }
        
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
        console.log("Course data received:", data);
        if (data && data.data) {
          setCourse(data.data);
        } else {
          setError("Course not found");
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError("Failed to load course data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [id]);

  // Check enrollment status
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
              // Check if course is completed
              setIsCourseCompleted(data.data.completed || false);
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
          setIsCourseCompleted(false);
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
        setIsEnrolled(false);
        setEnrollmentData(null);
        setIsCourseCompleted(false);
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
    if (!isEnrolled || !user?.id || !id || !course?.courseContent) return;
    
    // If this is the last video, mark course as completed
    if (activeVideoIndex === course.courseContent.length - 1) {
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
        
        // Mark course as completed in state
        setIsCourseCompleted(true);
        
        toast({
          title: "Course completed",
          description: "Congratulations on completing this course! You can now download your certificate.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
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

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to enroll in this course",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      navigate("/sign-in");
      return;
    }

    if (!course) return;

    try {
      navigate(`/payment/${course._id}/${course.price}/${user.id}`);
    } catch (error) {
      console.error("Error navigating to payment:", error);
      toast({
        title: "Error",
        description: "Failed to proceed to payment. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownloadCertificate = async () => {
    if (!user || !course) return;
    
    try {
      // Create a hidden div for the certificate
      const certificateContainerDiv = document.createElement('div');
      certificateContainerDiv.id = 'certificate-container';
      certificateContainerDiv.style.position = 'absolute';
      certificateContainerDiv.style.left = '-9999px';
      document.body.appendChild(certificateContainerDiv);
      
      // Render certificate template
      const certificateDate = enrollmentData?.completedAt || new Date();
      const certificateId = `BITS-${course._id.substring(0, 6)}-${user.id.substring(0, 6)}`;
      
      // Get user name - handle possible undefined values
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      // If userName is empty, use email or a default value
      const displayName = userName || user.email || "Student";
      
      // Random signature SVGs for instructor and director
      const signatures = [
        // Signature 1
        `<svg xmlns="http://www.w3.org/2000/svg" width="160" viewBox="0 0 300 80" height="40">
          <path d="M10,50 C40,10 60,90 90,50 C110,30 140,30 160,50 C180,65 200,5 250,40" stroke="#2563eb" fill="none" stroke-width="3"/>
        </svg>`,
        // Signature 2
        `<svg xmlns="http://www.w3.org/2000/svg" width="160" viewBox="0 0 300 80" height="40">
          <path d="M20,40 C50,20 70,70 100,40 C120,20 140,60 180,30 C220,10 240,50 280,30" stroke="#2563eb" fill="none" stroke-width="3"/>
        </svg>`,
        // Signature 3
        `<svg xmlns="http://www.w3.org/2000/svg" width="160" viewBox="0 0 300 80" height="40">
          <path d="M10,30 C30,50 80,10 120,40 C150,60 180,20 220,40 C240,50 260,30 290,40" stroke="#2563eb" fill="none" stroke-width="3"/>
        </svg>`,
      ];
      
      // Randomly select signatures
      const instructorSignature = signatures[Math.floor(Math.random() * signatures.length)];
      const directorSignature = signatures[Math.floor(Math.random() * signatures.length)];
      
      // Render the certificate manually since we can't use React here
      certificateContainerDiv.innerHTML = `
        <div class="certificate-container">
          <div class="certificate">
            <div class="certificate-header">
              <div class="logo">
                <h1>BitsElevate</h1>
              </div>
              <h2 class="certificate-title">Certificate of Completion</h2>
            </div>
            
            <div class="certificate-body">
              <p class="certificate-statement">This is to certify that</p>
              <h2 class="student-name">${displayName}</h2>
              <p class="certificate-statement">has successfully completed the course</p>
              <h3 class="course-name">"${course.name || course.title}"</h3>
              <p class="completion-date">on ${formatCertificateDate(certificateDate)}</p>
              
              <div class="certificate-footer">
                <div class="signature">
                  <div class="signature-svg">${instructorSignature}</div>
                  <div class="signature-line"></div>
                  <p>Course Instructor</p>
                </div>
                
                <div class="signature">
                  <div class="signature-svg">${directorSignature}</div>
                  <div class="signature-line"></div>
                  <p>BitsElevate Director</p>
                </div>
              </div>
              
              <div class="certificate-id">
                <p>Certificate ID: ${certificateId}</p>
              </div>
            </div>
            
            <div class="certificate-border"></div>
          </div>
        </div>
      `;
      
      // Add styles to the page if they don't exist
      const styleSheet = document.createElement("style");
      styleSheet.innerText = `
        .certificate-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 1000px;
          height: 700px;
          padding: 20px;
          background-color: #fff;
          box-sizing: border-box;
        }
        
        .certificate {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 30px;
          text-align: center;
          color: #333;
          background-color: #fff;
          background-image: 
            linear-gradient(rgba(185, 216, 252, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(185, 216, 252, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .certificate-border {
          position: absolute;
          top: 15px;
          left: 15px;
          right: 15px;
          bottom: 15px;
          border: 2px solid #2563eb;
          border-radius: 8px;
          z-index: 0;
          pointer-events: none;
        }
        
        .certificate::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-repeat: repeat;
          background-size: 150px;
          z-index: -1;
          opacity: 0.07;
        }
        
        .certificate-header {
          margin-bottom: 40px;
          position: relative;
          z-index: 1;
        }
        
        .logo {
          margin-bottom: 15px;
        }
        
        .logo h1 {
          font-size: 40px;
          font-weight: bold;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin: 0;
          font-family: 'Arial', sans-serif;
        }
        
        .certificate-title {
          font-size: 32px;
          font-weight: bold;
          text-transform: uppercase;
          color: #1e40af;
          letter-spacing: 2px;
          position: relative;
          display: inline-block;
          padding-bottom: 10px;
          margin-bottom: 0;
        }
        
        .certificate-body {
          margin-top: 30px;
          position: relative;
          z-index: 1;
        }
        
        .certificate-statement {
          font-size: 20px;
          margin: 10px 0;
          color: #4b5563;
        }
        
        .student-name {
          font-size: 36px;
          font-weight: bold;
          color: #1e40af;
          margin: 15px 0;
          text-transform: uppercase;
          font-family: 'Times New Roman', serif;
        }
        
        .course-name {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin: 15px 0;
          font-style: italic;
        }
        
        .completion-date {
          font-size: 18px;
          margin: 15px 0 40px;
          color: #4b5563;
        }
        
        .certificate-footer {
          display: flex;
          justify-content: space-around;
          margin-top: 60px;
          padding: 0 100px;
        }
        
        .signature {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .signature-svg {
          height: 40px;
          margin-bottom: 5px;
        }
        
        .signature-line {
          width: 200px;
          height: 2px;
          background-color: #2563eb;
          margin-bottom: 10px;
        }
        
        .signature p {
          font-size: 16px;
          font-weight: bold;
          color: #4b5563;
        }
        
        .certificate-id {
          margin-top: 40px;
          font-size: 14px;
          color: #6b7280;
        }
      `;
      document.head.appendChild(styleSheet);
      
      // Generate a clean filename
      const cleanCourseName = (course.name || course.title || "course").replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const cleanStudentName = displayName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const fileName = `bitselevate-certificate-${cleanCourseName}-${cleanStudentName}.pdf`;
      
      // Generate and download the PDF
      await generateCertificatePDF('certificate-container', fileName);
      
      // Clean up the DOM
      document.body.removeChild(certificateContainerDiv);
      
      toast({
        title: "Certificate Downloaded",
        description: "Your certificate has been generated and downloaded successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Certificate Download Failed",
        description: "There was an error generating your certificate. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="50vh">
        <Spinner size="xl" thickness="4px" color="blue.500" />
      </Flex>
    );
  }

  if (error || !course) {
    return (
      <Container maxW="container.lg" py={10}>
        <Box textAlign="center" py={10} px={6}>
          <Heading as="h2" size="xl" mt={6} mb={2}>
            {error || "Course not found"}
          </Heading>
          <Text color={'gray.500'}>
            We couldn't find the course you're looking for. Please try again or browse our other courses.
          </Text>
          <Button
            colorScheme="blue"
            mt={6}
            onClick={() => navigate('/all-courses')}
          >
            View All Courses
          </Button>
        </Box>
      </Container>
    );
  }

  // Get active video
  const currentContent = course.courseContent?.[activeVideoIndex];
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
              {course.name || course.title}
            </Heading>
            <Text fontSize="lg" fontWeight="normal" mb={4} opacity={0.9}>
              {course.overview || course.description}
            </Text>
            <Flex align="center" mt={2} wrap="wrap" gap={4}>
              <Flex align="center">
                <Box as="span" mr={2}>👨‍🏫</Box>
                <Text fontSize="sm">
                  Instructor: {course.author?.firstName || course.instructor?.firstName || 'Unknown'} {course.author?.lastName || course.instructor?.lastName || ''}
                </Text>
              </Flex>
              <Flex align="center">
                <Box as="span" mr={2}>⏱️</Box>
                <Text fontSize="sm">Duration: {course.duration} min</Text>
              </Flex>
              <Flex align="center">
                <Box as="span" mr={2}>🌐</Box>
                <Text fontSize="sm">Language: {course.language}</Text>
              </Flex>
            </Flex>
          </Box>
          <Box maxW={{ base: "300px", md: "300px" }} borderRadius="md" overflow="hidden">
            <Image 
              src={course.img || "https://placehold.co/300x150?text=Course+Image"} 
              alt={course.name || course.title}
              objectFit="cover"
              width="100%"
              height="auto"
              fallbackSrc="https://placehold.co/300x150?text=No+Image+Available"
            />
          </Box>
        </Flex>
      </Box>

      {isEnrolled && course.courseContent && course.courseContent.length > 0 ? (
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
              {course.courseContent.map((content, idx) => (
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
                  {activeVideoIndex === (course.courseContent.length - 1) ? "Complete Course" : "Next Video"}
                </Button>
              </Flex>
            </Box>
          </Box>

          {/* Certificate Section for Completed Courses */}
          {isCourseCompleted && (
            <Box
              gridColumn={{ base: "1", md: "1 / span 2" }}
              bg={bgColor}
              borderRadius="md"
              borderWidth="1px"
              borderColor={borderColor}
              p={6}
              mt={6}
            >
              <Flex align="center" mb={4}>
                <Box 
                  as="span" 
                  fontSize="2xl" 
                  mr={3}
                  role="img" 
                  aria-label="certificate"
                >
                  🎓
                </Box>
                <Heading size="md">Course Completion Certificate</Heading>
              </Flex>
              
              <Text mb={4}>
                Congratulations on completing this course! You have earned a certificate of completion.
                Click the button below to download your personalized certificate.
              </Text>
              
              <Button
                colorScheme="blue"
                leftIcon={<span>📄</span>}
                onClick={handleDownloadCertificate}
              >
                Download Certificate
              </Button>
            </Box>
          )}
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
                <Text mb={6}>{course.overview || course.description}</Text>
                
                {course.summary && course.summary.length > 0 && (
                  <Box mb={6}>
                    <Heading size="sm" mb={3}>What you'll learn:</Heading>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                      {course.summary.map((item, idx) => (
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
                    <Text>Duration: {course.duration} minutes</Text>
                  </Flex>
                  <Flex align="center">
                    <Box as="span" mr={2}>🌐</Box>
                    <Text>Language: {course.language}</Text>
                  </Flex>
                  <Flex align="center">
                    <Box as="span" mr={2}>🧑‍🏫</Box>
                    <Text>Instructor: {course.author?.firstName || course.instructor?.firstName || 'Unknown'} {course.author?.lastName || course.instructor?.lastName || ''}</Text>
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
              <Box 
                p={6} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={bgColor}
                borderColor={borderColor}
                boxShadow="md"
              >
                <Heading size="lg" mb={4}>
                  ₹{course.price}
                </Heading>
                {isEnrolled ? (
                  <Box>
                    <Button colorScheme="green" w="100%" mb={4} disabled>
                      ✓ You are enrolled in this course
                    </Button>
                    <Button colorScheme="blue" w="100%" onClick={() => navigate('/user-profile')}>
                      Go to My Courses
                    </Button>
                  </Box>
                ) : (
                  <Button 
                    colorScheme="blue" 
                    size="lg" 
                    w="100%"
                    onClick={handleEnroll}
                    mb={3}
                  >
                    Enroll Now
                  </Button>
                )}
                <Box mt={4}>
                  <Flex align="center" mb={2}>
                    <Box as="span" mr={2}>✓</Box>
                    <Text fontSize="sm">Full lifetime access</Text>
                  </Flex>
                  <Flex align="center" mb={2}>
                    <Box as="span" mr={2}>✓</Box>
                    <Text fontSize="sm">Access on all devices</Text>
                  </Flex>
                  <Flex align="center">
                    <Box as="span" mr={2}>✓</Box>
                    <Text fontSize="sm">Certificate of completion</Text>
                  </Flex>
                </Box>
              </Box>
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
}
