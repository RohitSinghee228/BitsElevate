import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer, toast } from 'react-toastify';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

import { IoAddCircleSharp } from "react-icons/io5";
import { MdAddToPhotos } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";
import { UserContext } from "../../UserContext"
import axios from "axios";
import { initializeApp } from "firebase/app";
import { useContext } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAelJ7dlq9btLTsRbGRQKj8p1XRrlo8cVo",
  authDomain: "codewave-39524.firebaseapp.com",
  projectId: "codewave-39524",
  storageBucket: "codewave-39524.appspot.com",
  messagingSenderId: "1035711570286",
  appId: "1:1035711570286:web:784b4042cc0cd42cac617f",
  measurementId: "G-5C37XVK0HF"
};

const app = initializeApp(firebaseConfig);

interface CourseFormValues {
  name: string;
  description: string;
  createdBy: string;
  price: number;
  duration: number;
  summary: string[];
  courseContent: Array<{
    videoLink: string;
    instructions: string[];
  }>;
  img?: string;
}

const CcreateNewCourse = () => {
  const { user } = useContext(UserContext);
  const userID = user?.id;
  const navigate = useNavigate();

  const initialValues: CourseFormValues = {
    name: "",
    description: "",
    createdBy: userID || "",
    price: 0,
    duration: 0,
    summary: [],
    courseContent: [{ videoLink: "", instructions: [] }],
  };

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageFile(file || null);
  };

  const uploadImageToFirebase = async () => {
    try {
      if (!imageFile) {
        throw new Error("No image file selected.");
      }

      const storage = getStorage(app);
      const storageRef = ref(storage);
      const imageRef = ref(storageRef, `images/${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageLink = await getDownloadURL(imageRef);
      return imageLink;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const onSubmit = async (values: CourseFormValues) => {
    try {
      const imageLink = await uploadImageToFirebase();
      values.img = imageLink || undefined;
      
      const response = await axios.post(
        "http://localhost:7071/api/courseManagement/create",
        values,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data);

      toast.success("Course created successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/admin/course-management");
      }, 2000);

    } catch (error) {
      console.error(error);
    }
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
  });

  const addSummaryPoint = () => {
    formik.setFieldValue("summary", [...formik.values.summary, ""]);
  };

  const removeSummaryPoint = (index: number) => {
    const updatedSummary = [...formik.values.summary];
    updatedSummary.splice(index, 1);
    formik.setFieldValue("summary", updatedSummary);
  };

  const addCourseContent = () => {
    formik.setFieldValue("courseContent", [
      ...formik.values.courseContent,
      { videoLink: "", instructions: [] },
    ]);
  };

  const removeCourseContent = (index: number) => {
    const updatedCourseContent = [...formik.values.courseContent];
    updatedCourseContent.splice(index, 1);
    formik.setFieldValue("courseContent", updatedCourseContent);
  };

  const addInstruction = (contentIndex: number) => {
    const updatedCourseContent = [...formik.values.courseContent];
    updatedCourseContent[contentIndex].instructions.push("");
    formik.setFieldValue("courseContent", updatedCourseContent);
  };

  const removeInstruction = (contentIndex: number, instructionIndex: number) => {
    const updatedCourseContent = [...formik.values.courseContent];
    updatedCourseContent[contentIndex].instructions.splice(instructionIndex, 1);
    formik.setFieldValue("courseContent", updatedCourseContent);
  };

  return (
    <div className="max-w-5x font-mono font-semibold mx-auto min-h-screen">
      <h1 className="text-2xl font-semibold text-center mt-8 mb-4">Create a Course</h1>
      <form onSubmit={formik.handleSubmit} className="grid grid-cols-2 gap-6">

        <div className="col-span-2">
          <div>
            <div className="mb-4">
              <label htmlFor="image" className="block mb-1">
                Image:
              </label>
              <input
                id="img"
                name="img"
                type="file"
                onChange={handleImageChange}
                className="w-full border shadow-md bg-blue-50 border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-1">
              Name:
            </label>
            <input
              id="name"
              name="name"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.name}
              placeholder="Enter course name"
              className="w-full  border shadow-md  bg-blue-50 border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-1">
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              onChange={formik.handleChange}
              value={formik.values.description}
              placeholder="Enter course description"
              className="w-full border shadow-md bg-blue-50 border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              rows={4}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="price" className="block mb-1">
              Price:
            </label>
            <input
              id="price"
              name="price"
              type="number"
              onChange={formik.handleChange}
              value={formik.values.price}
              placeholder="Enter course price"
              className="w-full border shadow-md  bg-blue-50 border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="duration" className="block mb-1">
              Duration:
            </label>
            <input
              id="duration"
              name="duration"
              type="number"
              onChange={formik.handleChange}
              value={formik.values.duration}
              placeholder="Enter course duration"
              className="w-full border shadow-md  bg-blue-50 border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

        </div>

        <div>
          <div className="mb-4">
            <label htmlFor="summary" className="block mb-1">
              Summary:
            </label>
            {formik.values.summary.map((point, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  name={`summary[${index}]`}
                  type="text"
                  onChange={formik.handleChange}
                  value={point}
                  placeholder="Enter summary point"
                  className="w-full shadow-md  bg-blue-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 mr-2"
                />
                <button
                  type="button"
                  onClick={() => removeSummaryPoint(index)}
                  className="  px-4 py-2 text-2xl rounded text-red-500 hover:text-red-600 focus:outline-none"
                >
                  <MdDelete />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSummaryPoint}
              className="text-blue-500 text-4xl px-4 py-2 rounded hover:text-blue-600 focus:outline-none"
            >
              <IoAddCircleSharp />
            </button>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <label className="block mb-1">Course Content:</label>
            {formik.values.courseContent.map((content, contentIndex) => (
              <div key={contentIndex} className="mb-6">
                <label htmlFor={`videoLink_${contentIndex}`} className="block mb-1">
                  Video Link:
                </label>
                <input
                  id={`videoLink_${contentIndex}`}
                  name={`courseContent[${contentIndex}].videoLink`}
                  type="text"
                  onChange={formik.handleChange}
                  value={content.videoLink}
                  placeholder="Enter video link"
                  className="w-full border shadow-md  bg-blue-50 border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />

                <div className="mt-4">
                  <label className="block mb-1">Instructions:</label>
                  {content.instructions.map((instruction, instructionIndex) => (
                    <div key={instructionIndex} className="flex items-center mb-2">
                      <input
                        name={`courseContent[${contentIndex}].instructions[${instructionIndex}]`}
                        type="text"
                        onChange={formik.handleChange}
                        value={instruction}
                        placeholder="Enter instruction"
                        className="w-full border shadow-md  bg-blue-50 border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 mr-2"
                      />
                      <button
                        type="button"
                        onClick={() => removeInstruction(contentIndex, instructionIndex)}
                        className="text-red-500 text-2xl  px-4 py-2 rounded hover:text-red-600 focus:outline-none"
                      >
                        <MdDeleteForever />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addInstruction(contentIndex)}
                    className="text-blue-500   px-4 py-1 rounded hover:text-blue-600 focus:outline-none"
                  >
                    <span className="flex space-x-2 flex-row"> <MdAddToPhotos className="text-2xl" /> <span className="text-blue-500">Instruction</span></span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeCourseContent(contentIndex)}
                  className="  rounded-xl text-red-600 px-4 py-1   mt-2 focus:outline-none"
                >
                  <span className="flex hover:text-red-800 space-x-2 flex-row"> <MdDeleteForever className="text-2xl" /> <span className="text-red-500">Course Content</span></span>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCourseContent}
              className="bg-blue-50 text-blue-600 border-2  border-blue-400 rounded-2xl font-semibold px-4 py-2 rounded hover:bg-blue-100 focus:outline-none"
            >
              Add Course Content
            </button>
          </div>
        </div>

        <div className="col-span-2 mt-2 flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
          >
            Create Course
          </button>
        </div>

      </form>
      <ToastContainer />
    </div>
  );
};

export default CcreateNewCourse;