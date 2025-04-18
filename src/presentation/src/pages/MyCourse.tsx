import { useEffect, useState } from "react";

import CourseContent from "../components/Home/Courses/CourseContent";
import MyCourseSideBar from "../components/Home/Courses/MyCourseSideBar";
import axios from "axios";
import { useParams } from "react-router-dom";

const MyCourse = () => {
  const { userId, courseId } = useParams();
  const [course, setCourse] = useState(null);
  const token = localStorage.getItem("token");

  console.log(userId, courseId);

  useEffect(() => {
    document.title = "My Course";

    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/courses/courseManagement/enrolledCourses/${userId}/${courseId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data) {
          console.log(response.data);
          setCourse(response.data);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    if (userId && courseId) {
      fetchCourse();
    }
  }, [userId, courseId, token]);

  if (!course) {
    return <div>Loading...</div>;
  }

  

  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="col-span-1">
        {course && <MyCourseSideBar course={course} />}
      </div>
      <div className="col-span-4">
        {course && <CourseContent course={course} />}
      </div>
    </div>
  );
  
};

export default MyCourse;
