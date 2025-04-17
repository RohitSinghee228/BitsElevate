import  { useEffect, useState } from 'react';

import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Course {
  _id: string;
  name: string;
  description: string;
}

export default function CourseData() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`http://localhost:7071/api/courseManagement/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCourse(response.data.data);
        console.log("Course Data:", response.data);
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    };
    fetchCourseData();
  }, [id]);

  return (
    <div>
      <h1>Course Details</h1>
      {course ? (
        <div>
          <p>Course ID: {course._id}</p>
          <p>Name: {course.name}</p>
          <p>Description: {course.description}</p>
          {/* Add more details as needed */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
