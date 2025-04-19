import * as Yup from "yup";

import { Field, FieldArray, Form, Formik } from "formik";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

import axios from "axios";
import { initializeApp } from "firebase/app";
import { toast } from "react-toastify";
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

interface Lesson {
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
}

interface CourseFormValues {
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  level: string;
  image: string;
  lessons: Lesson[];
  summary: string[];
  courseContent: {
    title: string;
    content: string;
    instructions: string[];
  }[];
}

interface LessonErrors {
  title?: string;
  content?: string;
  videoUrl?: string;
  duration?: string;
}

const CreateCourse = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const initialValues: CourseFormValues = {
    title: "",
    description: "",
    price: 0,
    duration: 0,
    category: "",
    level: "",
    image: "",
    lessons: [],
    summary: [],
    courseContent: [],
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    price: Yup.number().required("Price is required").min(0, "Price must be positive"),
    duration: Yup.number().required("Duration is required").min(0, "Duration must be positive"),
    category: Yup.string().required("Category is required"),
    level: Yup.string().required("Level is required"),
    lessons: Yup.array()
      .of(
        Yup.object().shape({
          title: Yup.string().required("Lesson title is required"),
          content: Yup.string().required("Lesson content is required"),
          videoUrl: Yup.string().required("Video URL is required"),
          duration: Yup.number().required("Lesson duration is required").min(0, "Duration must be positive"),
        })
      )
      .min(1, "At least one lesson is required"),
    summary: Yup.array().of(Yup.string()),
    courseContent: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required("Content title is required"),
        content: Yup.string().required("Content is required"),
        instructions: Yup.array().of(Yup.string()),
      })
    ),
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImageToFirebase = async () => {
    try {
      if (!imageFile) {
        toast.warning("Please select an image for the course");
        return null;
      }

      const storage = getStorage(app);
      const storageRef = ref(storage);
      const imageRef = ref(storageRef, `course-images/${Date.now()}-${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageLink = await getDownloadURL(imageRef);
      return imageLink;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleSubmit = async (values: CourseFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Upload image to Firebase and get URL
      const imageUrl = await uploadImageToFirebase();
      if (!imageUrl) {
        setIsSubmitting(false);
        return;
      }

      // Add image URL to form values
      const courseData = {
        ...values,
        image: imageUrl,
        img: imageUrl  // Add to both image and img fields for compatibility
      };

      await axios.post(
        "http://localhost:3001/api/courses/courseManagement/create",
        courseData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Course created successfully!");
      navigate("/admin/courses");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Course</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <Field
                  type="text"
                  name="title"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.title && touched.title && (
                  <div className="text-red-500 text-sm mt-1">{errors.title}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.description && touched.description && (
                  <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <Field
                  type="number"
                  name="price"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.price && touched.price && (
                  <div className="text-red-500 text-sm mt-1">{errors.price}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
                <Field
                  type="number"
                  name="duration"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.duration && touched.duration && (
                  <div className="text-red-500 text-sm mt-1">{errors.duration}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <Field
                  as="select"
                  name="category"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                </Field>
                {errors.category && touched.category && (
                  <div className="text-red-500 text-sm mt-1">{errors.category}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <Field
                  as="select"
                  name="level"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Field>
                {errors.level && touched.level && (
                  <div className="text-red-500 text-sm mt-1">{errors.level}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Course Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Course preview" 
                      className="h-40 w-auto object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Lessons</h2>
              <FieldArray name="lessons">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.lessons.map((_, index) => (
                      <div key={index} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Lesson {index + 1}</h3>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <Field
                              type="text"
                              name={`lessons.${index}.title`}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.lessons && typeof errors.lessons === "object" && errors.lessons[index] && (
                              <div className="text-red-500 text-sm mt-1">
                                {((errors.lessons[index] as LessonErrors).title as string)}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Content</label>
                            <Field
                              as="textarea"
                              name={`lessons.${index}.content`}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.lessons && typeof errors.lessons === "object" && errors.lessons[index] && (
                              <div className="text-red-500 text-sm mt-1">
                                {((errors.lessons[index] as LessonErrors).content as string)}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Video URL</label>
                            <Field
                              type="text"
                              name={`lessons.${index}.videoUrl`}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.lessons && typeof errors.lessons === "object" && errors.lessons[index] && (
                              <div className="text-red-500 text-sm mt-1">
                                {((errors.lessons[index] as LessonErrors).videoUrl as string)}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                            <Field
                              type="number"
                              name={`lessons.${index}.duration`}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.lessons && typeof errors.lessons === "object" && errors.lessons[index] && (
                              <div className="text-red-500 text-sm mt-1">
                                {((errors.lessons[index] as LessonErrors).duration as string)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        push({
                          title: "",
                          content: "",
                          videoUrl: "",
                          duration: 0,
                        })
                      }
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Lesson
                    </button>
                  </div>
                )}
              </FieldArray>
              {errors.lessons && typeof errors.lessons === "string" && (
                <div className="text-red-500 text-sm mt-1">{errors.lessons}</div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Course"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateCourse;