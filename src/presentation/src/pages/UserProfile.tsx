import 'react-toastify/dist/ReactToastify.css';

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';

import AddPaymentData from '../components/Payment/AddPaymentData';
import { Link } from 'react-router-dom';
import StripeProviderWrapper from '../components/Payment/StripeProviderWrapper';
import { ToastContainer } from 'react-toastify';
import UpdatePaymentData from '../components/Payment/UpdatePaymentData';
import { UserContext } from '../UserContext';
import ViewPaymentData from '../components/Payment/ViewPaymentData';

interface EnrolledCourse {
  _id: string;
  name: string;
  overview: string;
  img: string;
  price: number;
  duration: string;
  progress: number;
  enrollmentId: string;
  title?: string;      // Optional properties to avoid type errors
  description?: string;
}

export default function UserProfile() {
  const { user } = useContext(UserContext); // Access user data from UserContext
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const {
    isOpen: isAddPaymentOpen,
    onOpen: onAddPaymentOpen,
    onClose: onAddPaymentClose,
  } = useDisclosure();
  const {
    isOpen: isViewPaymentOpen,
    onOpen: onViewPaymentOpen,
    onClose: onViewPaymentClose,
  } = useDisclosure();
  const {
    isOpen: isUpdatePaymentOpen,
    onOpen: onUpdatePaymentOpen,
    onClose: onUpdatePaymentClose,
  } = useDisclosure();

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/courses/courseManagement/enrolledCourses/${user.id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('Enrolled courses raw data:', data);
          
          // Map the data to ensure necessary fields exist
          const processedCourses = data.data.map((course: any) => {
            // Use title as name if name doesn't exist
            if (!course.name && course.title) {
              course.name = course.title;
            }
            
            // Ensure overview exists (use description as fallback)
            if (!course.overview && course.description) {
              course.overview = course.description;
            }
            
            return course;
          });
          
          console.log('Processed course data:', processedCourses);
          setEnrolledCourses(processedCourses || []);
        } else {
          console.error('Failed to fetch enrolled courses');
          setEnrolledCourses([]);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setEnrolledCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user?.id]);

  const firstName = user?.firstName;
  const lastName = user?.lastName;
  const email = user?.email;
  const role = user?.role;

  return (
    <div className="min-h-screen mb-20">
      <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex mt-10">
          <div className="md:flex-shrink-0">
            {/* Display user avatar */}
            <img className="h-48 w-full object-cover md:w-48" src="/user1.png" alt="User Avatar" />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">User Profile</div>
            {/* Display user data */}
            <div className="mt-4">
              <div className="text-lg font-semibold">
                {firstName} {lastName}
              </div>
              <div className="text-gray-500">{email}</div>
              {/* Display role */}
              {role === 'user' && <div className="text-gray-500">Student</div>}
              {role === 'creator' && <div className="text-gray-500">Creator</div>}
              {role === 'admin' && <div className="text-gray-500">Admin</div>}
            </div>
          </div>
        </div>
      </div>
      
      {/* Enrolled Courses Section */}
      <div className="max-w-6xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-6">My Enrolled Courses</h2>
        
        {loading ? (
          <div className="text-center py-10">Loading your courses...</div>
        ) : enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={course.img || '/placeholder-course.jpg'} 
                  alt={course.name || course.title || 'Course'} 
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.currentTarget.src = '/placeholder-course.jpg'; }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {course.name || course.title || 'Untitled Course'}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 h-12">
                    {course.overview || course.description || 'No description available'}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${((course.progress || 0) * 20)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Progress: {Math.round((course.progress || 0) * 20)}%
                    </span>
                    <Link 
                      to={`/courses/${course._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-lg mb-4">You haven't enrolled in any courses yet.</p>
            <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md">
              Browse Courses
            </Link>
          </div>
        )}
      </div>
      
      <div className="flex justify-center mt-10 space-x-4">
        <Button onClick={onAddPaymentOpen} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Payment Data
        </Button>
        <Button onClick={onViewPaymentOpen} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          View Payment Data
        </Button>
        <Button onClick={onUpdatePaymentOpen} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Update Payment Data
        </Button>
      </div>

      <Modal isOpen={isAddPaymentOpen} onClose={onAddPaymentClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Payment Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <StripeProviderWrapper>
              <AddPaymentData 
                userId={user?.id || ''} 
                authToken={localStorage.getItem('token') || ''} 
                onClose={onAddPaymentClose} 
              />
            </StripeProviderWrapper>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onAddPaymentClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isViewPaymentOpen} onClose={onViewPaymentClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>View Payment Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ViewPaymentData 
              userId={user?.id || ''} 
              authToken={localStorage.getItem('token') || ''} 
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewPaymentClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isUpdatePaymentOpen} onClose={onUpdatePaymentClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Payment Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <StripeProviderWrapper>
              <UpdatePaymentData 
                userId={user?.id || ''} 
                authToken={localStorage.getItem('token') || ''} 
                onClose={onUpdatePaymentClose} 
              />
            </StripeProviderWrapper>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onUpdatePaymentClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ToastContainer />
    </div>
  );
}
