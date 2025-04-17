import { FaFastBackward, FaFastForward } from "react-icons/fa";
import { useContext, useState } from "react";

import Confetti from "react-confetti";
import Swal from "sweetalert2";
import { UserContext } from "../../../UserContext";
import axios from "axios";

interface Course {
  step?: number;
  courseId: {
    _id: string;
    name: string;
    courseContent: Array<{
      videoLink: string;
      instructions: string[];
    }>;
  };
}

const CourseContent = ({ course }: { course: Course }) => {
  console.log("Received course data:", course);
  
  // Initialize state with proper null checks
  const [currentContentIndex, setCurrentContentIndex] = useState(() => {
    // If course.step is undefined or null, default to 0
    return course?.step ?? 0;
  });
  const [stepCompleted, setStepCompleted] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  
  // Safely access course data with proper null checks
  const courseId = course?.courseId || {};
  const courseContent = Array.isArray(courseId?.courseContent) ? courseId.courseContent : [];
  const name = courseId?.name || "Course";
  
  const { user } = useContext(UserContext);

  console.log("Current content index:", currentContentIndex);
  console.log("Course content:", courseContent);
  console.log("Course name:", name);

  const handleComplete = async () => {
    setStepCompleted(true);
    console.log("Completing step with:", {
      userId: user?.id,
      courseId: courseId._id,
      currentContentIndex
    });
    
    try {
      if (currentContentIndex === courseContent.length - 1) {
        const response = await axios.post(
          `http://localhost:7071/api/courseManagement/completedCourse`,
          {
            userId: user?.id,
            courseId: courseId._id,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.status === 200) {
          setCourseCompleted(true);
          Swal.fire({
            icon: "success",
            title: "Course Completed",
            text: "Congratulations! You have completed this course.",
            confirmButtonText: "OK",
          });
        }
      } else {
        const response = await axios.post(
          `http://localhost:7071/api/courseManagement/saveProgress`,
          {
            userId: user?.id,
            courseId: courseId._id,
            step: currentContentIndex,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Step Completed",
            text: "You have completed this step.",
            confirmButtonText: "OK",
          });
        }
      }
    } catch (error) {
      console.error("Error completing step:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        confirmButtonText: "OK",
      });
    }
  };

  const handleBack = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
      setStepCompleted(false);
    }
  };

  const handleNext = () => {
    if (currentContentIndex < courseContent.length - 1 && stepCompleted) {
      setCurrentContentIndex(currentContentIndex + 1);
      setStepCompleted(false);
    }
  };

  // Check if course content exists and is valid
  if (!Array.isArray(courseContent) || courseContent.length === 0) {
    console.log("No course content available");
    return (
      <div className="w-full mx-auto mt-8 p-4 border rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold font-mono mb-4">{name}</h1>
        <div className="text-red-500">No course content available</div>
      </div>
    );
  }

  // Ensure currentContentIndex is within bounds
  const safeContentIndex = Math.min(Math.max(0, currentContentIndex), courseContent.length - 1);
  if (currentContentIndex !== safeContentIndex) {
    setCurrentContentIndex(safeContentIndex);
  }

  const currentContent = courseContent[safeContentIndex];
  console.log("Current content:", currentContent);

  if (!currentContent) {
    console.log("Current content is invalid");
    return (
      <div className="w-full mx-auto mt-8 p-4 border rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold font-mono mb-4">{name}</h1>
        <div className="text-red-500">Invalid content</div>
      </div>
    );
  }

  const videoId = currentContent.videoLink ? currentContent.videoLink.split("=")[1] : null;
  console.log("Video ID:", videoId);

  return (
    <div className="w-full mx-auto mt-8 p-4 border rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold font-mono mb-4">{name}</h1>

      <div className="mb-8">
        <h2 className="text-lg font-mon font-semibold">Content {safeContentIndex + 1}</h2>
        <div className="mb-4">
          <div className="border md:px-5 flex flex-row justify-center">
            {videoId ? (
              <iframe
                width="60%"
                height="500"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-red-500">No video available for this content</div>
            )}
          </div>

          <p className="my-4 text-xl font-mono font-semibold">Instructions:</p>
          <ul>
            {Array.isArray(currentContent.instructions) && currentContent.instructions.map((instruction, i) => (
              <li key={i} className="font-semibold font-mono">
                🔴{instruction}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={safeContentIndex === 0}
            className="bg-blue-500 text-white rounded-xl px-4 py-2 hover:bg-blue-600 focus:outline-none"
          >
            <FaFastBackward />
            Back
          </button>
          {courseCompleted ? (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={200}
            />
          ) : (
            <button
              onClick={handleComplete}
              className={`bg-blue-300 rounded-xl text-slate-600 font-semibold px-4 py-2 hover:bg-blue-400 focus:outline-none ${
                stepCompleted ? "cursor-not-allowed" : ""
              }`}
              disabled={stepCompleted}
            >
              {safeContentIndex === courseContent.length - 1
                ? "Finished"
                : stepCompleted
                ? "Completed"
                : "Complete Step"}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!stepCompleted}
            className={`bg-blue-500 rounded-xl text-white px-4 py-2 hover:bg-blue-600 focus:outline-none ${
              stepCompleted ? "" : "opacity-50 pointer-events-none"
            }`}
          >
            Next <FaFastForward />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
