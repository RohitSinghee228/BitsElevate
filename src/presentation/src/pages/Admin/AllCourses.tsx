import { ENDPOINTS, getAuthHeader } from "../../utils/apiConfig";
import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import { RiEyeLine } from 'react-icons/ri';
import axios from 'axios';

interface Course {
  _id: string;
  title: string;
  img?: string;
  instructor?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  price: number;
}

const AllCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  // Get all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          ENDPOINTS.COURSES.GET_ALL,
          {
            headers: getAuthHeader(),
          }
        );
        console.log("Courses data:", response.data.data);
        setCourses(response.data.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Delete course by ID
  const handleDeleteCourse = async (id: string) => {
    try {
      await axios.delete(
        ENDPOINTS.COURSES.DELETE(id),
        {
          headers: getAuthHeader(),
        }
      );
      setCourses(courses.filter((course) => course._id !== id));
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold mb-4">All Courses</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(courses) && courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.img ? (
                      <img src={course.img} alt={course.title} className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.instructor ? 
                      `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}` : 
                      'Unknown'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-red-600 hover:text-red-900 mr-2"
                      onClick={() => handleDeleteCourse(course._id)}
                    >
                      Delete
                    </button>
                    <Link to={`/courses/${course._id}`} className="text-indigo-600 hover:text-indigo-900">
                      <RiEyeLine />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">No courses available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllCourses;
