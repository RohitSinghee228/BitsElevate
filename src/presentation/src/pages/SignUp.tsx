import { Link, useNavigate } from "react-router-dom";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { AxiosError } from "axios";
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

import Swal from "sweetalert2";
import api from "../services/api";

export default function SignUp() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false); // State to track loading
  const navigate = useNavigate();

  // Ensure signOut when component mounts to clear any previous sessions
  useEffect(() => {
    signOut(auth).catch(console.error);
  }, []);

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      
      // Ask for role first
      const roleResult = await Swal.fire({
        title: 'Choose Role',
        input: 'select',
        inputOptions: {
          'student': 'Student',
          'instructor': 'Instructor',
          'creator': 'Creator',
          'admin': 'Admin'
        },
        inputPlaceholder: 'Select your role',
        showCancelButton: true,
        confirmButtonText: 'Continue',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        inputValidator: (value) => {
          if (!value) {
            return 'Please select your role';
          }
        }
      });
      
      if (!roleResult.isConfirmed) {
        setLoading(false);
        return;
      }
      
      const selectedRole = roleResult.value;
      
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if email is from BITS domain
      if (!user.email?.endsWith('@pilani.bits-pilani.ac.in')) {
        await signOut(auth);
        throw new Error('Please use your BITS email address.');
      }

      console.log('Google sign-up successful:', user.email);
      
      // Extract BITS ID from email (e.g., h20240194 from h20240194@pilani.bits-pilani.ac.in)
      const bitsId = user.email.split('@')[0];
      const [firstName, lastName] = (user.displayName || 'BITS User').split(' ');
      
      // Create user data for registration
      const userData = {
        firstName: firstName || bitsId,
        lastName: lastName || '',
        email: user.email,
        password: `bits${bitsId}`, // Auto-generate password
        role: selectedRole,
        googleId: user.uid,
        profilePicture: user.photoURL
      };
      
      console.log('BITS Registration attempt with:', JSON.stringify(userData, null, 2));
      
      // Register with backend
      try {
        // Try to register user with Google auth endpoint first
        await api.post('/users/google-auth', {
          email: user.email,
          name: user.displayName || 'BITS User',
          uid: user.uid,
          photoURL: user.photoURL,
          role: selectedRole
        });
        
        console.log('Google auth registration successful');
        handleSuccessfulRegistration();
      } catch (authError) {
        // If that fails, try regular registration
        try {
          const response = await api.post("/users/register", userData);
          console.log('Registration response:', response.data);
          handleSuccessfulRegistration();
        } catch (registerError) {
          // As a last resort, try the auth endpoint
          const response = await api.post("/users/auth/register", userData);
          console.log('Registration response from auth endpoint:', response.data);
          handleSuccessfulRegistration();
        }
      }
    } catch (error) {
      console.error('Google sign up error:', error);
      await signOut(auth);
      Swal.fire({
        title: 'Sign-up Failed',
        text: error instanceof Error ? error.message : 'Failed to sign up with BITS ID',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegistration = async (userData: any) => {
    try {
      // Try to register user with new endpoint first
      try {
        const response = await api.post("/users/register", userData);
        console.log('Registration response:', response.data);
        
        handleSuccessfulRegistration();
      } catch (registerError) {
        console.log('First registration attempt failed, trying auth endpoint...');
        
        // If that fails, try with the auth endpoint
        const response = await api.post("/users/auth/register", userData);
        console.log('Registration response from auth endpoint:', response.data);
        
        handleSuccessfulRegistration();
      }
    } catch (error) {
      console.error('Registration error details:', error);
      
      // Check for Axios error with response
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message 
        || (axiosError.message ? axiosError.message : 'Registration failed. Please try again.');
      
      console.error('Error message:', errorMessage);
      
      Swal.fire({
        title: "Registration Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false); // Set loading to false when sign-up process finishes
    }
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form data
    if (!firstName || !lastName || !email || !password || !role) {
      Swal.fire({
        title: "Error",
        text: "All fields are required",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      return;
    }
    
    try {
      setLoading(true); // Set loading to true when sign-up process starts
      
      // Create registration data object
      const userData = {
        firstName,
        lastName,
        email,
        password,
        role
      };
      
      // For debugging
      console.log('Registration attempt with:', JSON.stringify(userData, null, 2));
      
      handleRegistration(userData);
    } catch (error) {
      console.error('Registration error details:', error);
      
      // Check for Axios error with response
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message 
        || (axiosError.message ? axiosError.message : 'Registration failed. Please try again.');
      
      console.error('Error message:', errorMessage);
      
      Swal.fire({
        title: "Registration Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false); // Set loading to false when sign-up process finishes
    }
  };
  
  const handleSuccessfulRegistration = () => {
    Swal.fire({
      title: "Account Created",
      text: "Your account has been created successfully!",
      icon: "success",
      confirmButtonText: "Continue",
    });
    navigate("/sign-in");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(e.target.value);
  };
  
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  return (
    <>
      <div className="login flex justify-center items-center ">
        <div className="login__content items-center justify-center rounded-lg mt-14 shadow-md p-10 w-full sm:w-[450px] max-w-[90%]">
          <p className="text-center text-blue-500 font-bold text-2xl mb-8">Sign Up and Start Learning!</p>
          
          {/* Sign in with BITS ID button hidden temporarily 
          <button
            type="button"
            onClick={() => handleGoogleSignUp()} 
            className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition duration-300 text-lg font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#ffffff">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            <span>Sign in with BITS ID</span>
          </button>
          */}
          
          {/* "or" divider hidden temporarily
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 bg-white">or</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          */}
          
          <div className="mt-8">
            <p className="text-center text-lg font-semibold mb-4">Sign Up with Email</p>
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="flex flex-col space-y-2">
                <label htmlFor="firstName" className="text-gray-700 text-lg font-medium">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => handleInputChange(e, setFirstName)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="lastName" className="text-gray-700 text-lg font-medium">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => handleInputChange(e, setLastName)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="email" className="text-gray-700 text-lg font-medium">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => handleInputChange(e, setEmail)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="password" className="text-gray-700 text-lg font-medium">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => handleInputChange(e, setPassword)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="role" className="text-gray-700 text-lg font-medium">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={handleSelectChange}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="creator">Creator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-500 text-white py-3 px-4 text-lg font-medium rounded-md hover:bg-blue-600 transition duration-300"
                disabled={loading}
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
            <p className="text-center mt-6 text-lg">
              Already have an account? <Link to="/sign-in" className="text-blue-500 hover:underline font-medium">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
