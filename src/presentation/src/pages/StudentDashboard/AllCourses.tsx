import { Box, Button, Flex, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import Card from '../../components/Home/Courses/Card';
import { ENDPOINTS } from '../../utils/apiConfig';
import SortSideBar from '../../components/StudentDashboard/SortSideBar';
import axios from 'axios';

interface Course {
  _id: string;
  title: string;
  name: string;
  category: string;
  description: string;
  img: string;
  price: string | number;
  createdAt: string;
}

export default function AllCourses() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState({ type: '', order: '' });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const coursesPerPage = 6;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.COURSES.GET_ALL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        
        if (response.data && response.data.data) {
          console.log("Fetched courses:", response.data.data);
          setCourses(response.data.data);
        } else {
          setError("No courses found");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Sorting function
  const handleSort = (option: string, type: string) => {
    setSortOption({ type, order: option });
  };

  // Sort courses based on selected option
  const sortedCourses = [...courses];
  if (sortOption.type === 'price') {
    sortedCourses.sort((a, b) => {
      const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
      const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
      return sortOption.order === 'asc' 
        ? priceA - priceB 
        : priceB - priceA;
    });
  } else if (sortOption.type === 'time') {
    sortedCourses.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOption.order === 'latest' ? dateB - dateA : dateA - dateB;
    });
  }

  // Calculate the index of the last course on the current page
  const indexOfLastCourse = currentPage * coursesPerPage;

  // Calculate the index of the first course on the current page
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;

  // Get the current courses for the current page
  const currentCourses = sortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="50vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error && courses.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl" color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <div className='py-8'>
      <h1 className="text-4xl text-blue-500 font-extrabold text-center mt-10">All Courses</h1>
      <Flex>
        <SortSideBar handleSort={handleSort} />
        
        <Flex direction="column" width="80%" p="20px" m="auto">
          {currentCourses.length > 0 ? (
            <Flex flexWrap="wrap" justifyContent="center">
              {currentCourses.map((course) => (
                <Box key={course._id} width={{ base: "100%", md: "50%", lg: "33.33%" }} p="10px">
                  <Card 
                    _id={course._id}
                    name={course.title || course.name}
                    description={course.description}
                    price={course.price.toString()}
                    img={course.img || "https://placehold.co/300x200?text=No+Image"}
                  />
                </Box>
              ))}
            </Flex>
          ) : (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg">No courses available. Check back later!</Text>
            </Box>
          )}
        </Flex>
      </Flex>
      
      {/* Pagination */}
      {courses.length > coursesPerPage && (
        <Flex justifyContent="center" mt="20px">
          {[...Array(Math.ceil(courses.length / coursesPerPage))].map((_, index) => (
            <Button
              key={index}
              mx="2"
              onClick={() => paginate(index + 1)}
              colorScheme={currentPage === index + 1 ? 'blue' : 'gray'}
            >
              {index + 1}
            </Button>
          ))}
        </Flex>
      )}
    </div>
  );
}