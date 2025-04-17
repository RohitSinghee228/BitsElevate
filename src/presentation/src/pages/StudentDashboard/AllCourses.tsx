import { Button, Flex } from '@chakra-ui/react';

import { Box } from '@chakra-ui/react';
import Card from '../../components/Home/Courses/Card';
import SortSideBar from '../../components/StudentDashboard/SortSideBar';
import  { useState } from 'react';

export default function AllCourses() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState({ type: '', order: '' });
  const coursesPerPage = 6;

  // Hardcoded data for demonstration
  const allCourses = [
    {
        _id: "1",
        title: "React Course",
        name: "React Course",
        category: "Web Development",
        description: "Learn React for building modern web applications.",
        course: "React",
        img: "/react.png",
        whatYouLearn: [
          "Build a React application from scratch",
          "Learn React hooks",
          "Understand React routing",
          "Build responsive web applications",
        ],
        price: "100",
        Author: "John Doe",
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        _id: "2",
        title: "JavaScript Course",
        name: "JavaScript Course",
        category: "Web Development",
        description: "Master JavaScript for frontend and backend development.",
        course: "JavaScript",
        img: "/js.png",
        whatYouLearn: [
          "Understand JavaScript fundamentals",
          "Learn ES6 features",
          "Build a JavaScript project",
          "Understand JavaScript closures",
        ],
        price: "100",
        Author: "John Doe",
        createdAt: "2024-01-02T00:00:00.000Z"
    },
    {
        _id: "3",
        title: "AWS Course",
        name: "AWS Course",
        category: "Cloud Computing",
        description: "Become proficient in AWS cloud services.",
        course: "AWS",
        img: "/aws.png",
        price: "150",
        createdAt: "2024-01-03T00:00:00.000Z"
    },
    {
        _id: "4",
        title: "HTML/CSS/JS Course",
        name: "HTML/CSS/JS Course",
        category: "Web Development",
        description: "Learn the basics of web development with HTML, CSS, and JavaScript.",
        course: "HTML/CSS/JS",
        img: "/htmlcssjs.png",
        price: "80",
        createdAt: "2024-01-04T00:00:00.000Z"
    },
    {
        _id: "5",
        title: "PHP Course",
        name: "PHP Course",
        category: "Web Development",
        description: "Master PHP for server-side web development.",
        course: "PHP",
        img: "/php.png",
        price: "90",
        createdAt: "2024-01-05T00:00:00.000Z"
    },
    {
        _id: "6",
        title: "Java Course",
        name: "Java Course",
        category: "Software Development",
        description: "Learn Java programming for building applications.",
        course: "Java",
        img: "/java.png",
        price: "120",
        createdAt: "2024-01-06T00:00:00.000Z"
    },
    {
        _id: "7",
        title: "C++ Course",
        name: "C++ Course",
        category: "Software Development",
        description: "Master C++ programming for system and application development.",
        course: "C++",
        img: "/c++.png",
        price: "110",
        createdAt: "2024-01-07T00:00:00.000Z"
    },
    {
        _id: "8",
        title: "Docker Course",
        name: "Docker Course",
        category: "DevOps",
        description: "Learn Docker for containerization and deployment.",
        course: "Docker",
        img: "/27.png",
        price: "130",
        createdAt: "2024-01-08T00:00:00.000Z"
    }
  ];

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Sorting function
  const handleSort = (option: string, type: string) => {
    setSortOption({ type, order: option });
  };

  // Sort courses based on selected option
  const sortedCourses = [...allCourses];
  if (sortOption.type === 'price') {
    sortedCourses.sort((a, b) => {
      return sortOption.order === 'asc' 
        ? Number(a.price) - Number(b.price) 
        : Number(b.price) - Number(a.price);
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

  return (
    <div className='py-8'>
      <h1 className="text-4xl text-blue-500 font-extrabold text-center mt-10">All Courses</h1>
      <Flex>
      <SortSideBar handleSort={handleSort} />
      
        <Flex direction="column" width="80%" p="20px" m="auto">
          <Flex flexWrap="wrap" justifyContent="center">
            {/* Render sorted courses */}
            {currentCourses.map((course) => (
              <Box key={course._id} width={{ base: "100%", md: "50%", lg: "33.33%" }} p="10px">
                <Card {...course} />
              </Box>
            ))}
          </Flex>
        </Flex>
      </Flex>
      {/* Pagination */}
      {allCourses.length > coursesPerPage && (
        <Flex justifyContent="center" mt="20px">
          {[...Array(Math.ceil(allCourses.length / coursesPerPage))].map((_, index) => (
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