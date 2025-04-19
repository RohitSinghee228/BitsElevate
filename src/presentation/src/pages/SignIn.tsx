import { Link, useNavigate } from 'react-router-dom';
import React, { ChangeEvent, FormEvent, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

import { AxiosError } from 'axios';
import Swal from "sweetalert2";
import { UserContext } from '../UserContext';
import api from '../services/api';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // State to track loading
  const navigate = useNavigate();
  const { setUserData } = useContext(UserContext);

  // Ensure signOut when component mounts to clear any previous sessions
  useEffect(() => {
    signOut(auth).catch(console.error);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if email is from BITS domain
      if (!user.email?.endsWith('@pilani.bits-pilani.ac.in')) {
        await signOut(auth);
        throw new Error('Please use your BITS email address.');
      }

      console.log('Google sign-in successful:', user.email);
      
      // Try to authenticate with your backend
      try {
        // Create or get user from your backend
        const response = await api.post('/users/google-auth', {
          email: user.email,
          name: user.displayName || 'BITS User',
          uid: user.uid,
          photoURL: user.photoURL
        });
        
        // Get token from your backend
        const { token, user: userData } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set user in context
        setUserData(userData);
        
        // Success message
        Swal.fire({
          title: 'Logged In',
          text: 'You have successfully logged in with BITS ID!',
          icon: 'success',
          confirmButtonText: 'Continue',
        });
        
        // Navigate based on role
        if (userData.role === 'student') {
          navigate('/student-dashboard');
        } else if (userData.role === 'creator') {
          navigate('/creator');
        } else if (userData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } catch (backendError) {
        console.error('Backend auth error:', backendError);
        
        // If backend authentication fails, try to register user
        try {
          // Extract BITS ID from email (e.g., h20240194 from h20240194@pilani.bits-pilani.ac.in)
          const bitsId = user.email.split('@')[0];
          const [firstName, lastName] = (user.displayName || 'BITS User').split(' ');
          
          // Auto-register the user
          await api.post('/users/register', {
            email: user.email,
            password: `bits${bitsId}`, // Auto-generate password
            firstName: firstName || bitsId,
            lastName: lastName || '',
            role: 'student' // Default role
          });
          
          // After registration, log them in
          const loginResponse = await api.post('/users/login', {
            email: user.email,
            password: `bits${bitsId}`
          });
          
          const { token, user: newUser } = loginResponse.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(newUser));
          
          setUserData(newUser);
          
          Swal.fire({
            title: 'Account Created',
            text: 'Welcome! Your account has been created with your BITS ID.',
            icon: 'success',
            confirmButtonText: 'Continue',
          });
          
          navigate('/student-dashboard');
        } catch (registrationError) {
          console.error('Registration error:', registrationError);
          throw new Error('Could not create account with BITS ID.');
        }
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      await signOut(auth);
      Swal.fire({
        title: 'Sign-in Failed',
        text: error instanceof Error ? error.message : 'Failed to sign in with BITS ID',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (loginData: { email: string; password: string }) => {
    try {
      let response;
      
      // Try the regular endpoint first
      try {
        response = await api.post('/users/login', loginData);
        console.log('Login response from regular endpoint:', response.data);
      } catch (loginError) {
        console.log('First login attempt failed, trying auth endpoint...');
        // If that fails, try the auth endpoint
        response = await api.post('/users/auth/login', loginData);
        console.log('Login response from auth endpoint:', response.data);
      }
      
      // Get user data and token from response
      const { user, token } = response.data;
      
      // Save token in local storage
      localStorage.setItem('token', token);
      
      // Save user data in local storage
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set user data in context
      setUserData(user);
      
      // Display success alert
      Swal.fire({
        title: 'Logged In',
        text: 'You have successfully logged in!',
        icon: 'success',
        confirmButtonText: 'Continue',
      });
      
      // Redirect based on user role
      if (user.role === 'student') {
        navigate('/student-dashboard');
      } else if (user.role === 'creator') {
        navigate('/creator');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'instructor') {
        navigate('/creator'); // Assume instructors go to creator dashboard too
      } else {
        navigate('/'); // Default to home page
      }
    } catch (error) {
      console.error('Login error:', error);
      const axiosError = error as AxiosError<{ message: string }>;
      // Display error alert
      Swal.fire({
        title: 'Login Failed',
        text: axiosError.response?.data?.message || 'Invalid credentials. Please check your email and password.',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
      throw error; // Rethrow to handle in the calling function
    } finally {
      setLoading(false); // Set loading to false when sign-in process finishes
    }
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      Swal.fire({
        title: 'Error',
        text: 'Email and password are required',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
      return;
    }
    
    try {
      setLoading(true); // Set loading to true when sign-in process starts
      
      // Create login data object
      const loginData = {
        email,
        password
      };
      
      // For debugging
      console.log('Login attempt with:', { email });
      
      await handleLogin(loginData);
      
    } catch (error) {
      // Error is already handled in handleLogin
      console.error('Sign in form submission error:', error);
    }
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(e.target.value);
  };

  return (
    <>
      <div className="login flex justify-center items-center">
        <div className="login__content rounded-lg mt-14 shadow-md p-10 w-full sm:w-[450px] max-w-[90%]">
          {/* Sign in with BITS ID button hidden temporarily 
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition duration-300 text-lg font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#ffffff">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            <span>Sign in with BITS ID</span>
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 bg-white">or</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          */}

          <p className="text-center text-blue-500 font-bold text-2xl mb-6">Login to Your Account</p>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label htmlFor="email" className="text-gray-700 text-lg font-medium">Email Address</label>
              <input
                id="email" 
                type="email"
                value={email}
                onChange={(e) => handleInputChange(e, setEmail)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="password" className="text-gray-700 text-lg font-medium">Password</label>
              <input
                id="password" 
                type="password"
                value={password}
                onChange={(e) => handleInputChange(e, setPassword)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white py-3 px-4 text-lg font-medium rounded-md hover:bg-blue-600 transition duration-300"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center mt-6 text-lg">
            Don't have an account? <Link to="/sign-up" className="text-blue-500 hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
     
    </>
  );
}
