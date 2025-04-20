import { Box, Button, Flex, Heading, Image, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import Card from "../../components/Home/Courses/Card";
import { useLocation } from "react-router-dom";

interface Course {
  _id: string;
  title: string;
  name: string;
  category: string;
  description: string;
  overview?: string;
  course?: string;
  img: string;
  price: number | string;
  Author?: string;
  author?: {
    firstName: string;
    lastName: string;
  };
  instructor?: {
    firstName: string;
    lastName: string;
  };
  whatYouLearn?: string[];
  summary?: string[];
}

export default function SearchResults() {
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setSearchQuery(searchParams.get("search") || "");
  }, [location]); 

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/courses/courseManagement/getAll');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.data) {
          setCourses(data.data);
        } else {
          setCourses([]);
        }
        
      } catch (error: any) {
        console.error("Error fetching courses:", error);
        setError(error.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Search in title/name
    if ((course.title && course.title.toLowerCase().includes(query)) || 
        (course.name && course.name.toLowerCase().includes(query))) {
      return true;
    }
    
    // Search in description/overview
    if ((course.description && course.description.toLowerCase().includes(query)) ||
        (course.overview && course.overview.toLowerCase().includes(query))) {
      return true;
    }
    
    // Search in category
    if (course.category && course.category.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search in course field (if exists)
    if (course.course && course.course.toLowerCase().includes(query)) {
      return true;
    }
    
    return false;
  });

  // Calculate the index of the last course on the current page
  const indexOfLastCourse = currentPage * coursesPerPage;

  // Calculate the index of the first course on the current page
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;

  // Get the current courses for the current page
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );

  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="50vh">
        <Spinner size="xl" thickness="4px" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={10}>
        <Heading as="h2" size="xl" color="red.500">
          Error
        </Heading>
        <Text mt={4}>{error}</Text>
      </Box>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl text-blue-500 font-extrabold text-center mt-10">
        {searchQuery ? `Search Results for "${searchQuery}"` : "All Courses"}
      </h1>
      {filteredCourses.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <Text fontSize="xl">No courses found matching your search.</Text>
          <Text mt={2} color="gray.600">Try a different search term or browse all courses.</Text>
        </Box>
      ) : (
        <Flex direction="column" width="80%" p="20px" m="auto">
          <Flex flexWrap="wrap" justifyContent="center">
            {/* Render filtered courses */}
            {currentCourses.map((course) => (
              <Box
                key={course._id}
                width={{ base: "100%", md: "50%", lg: "33.33%" }}
                p="10px"
              >
                <Card 
                  _id={course._id}
                  img={course.img}
                  name={course.name || course.title}
                  description={course.description}
                  price={String(course.price)}
                />
              </Box>
            ))}
          </Flex>
        </Flex>
      )}
      {/* Pagination */}
      {filteredCourses.length > coursesPerPage && (
        <Flex justifyContent="center" mt="20px">
          {[...Array(Math.ceil(filteredCourses.length / coursesPerPage))].map(
            (_, index) => (
              <Button
                key={index}
                mx="2"
                onClick={() => setCurrentPage(index + 1)}
                colorScheme={currentPage === index + 1 ? "blue" : "gray"}
              >
                {index + 1}
              </Button>
            )
          )}
        </Flex>
      )}
    </div>
  );
}