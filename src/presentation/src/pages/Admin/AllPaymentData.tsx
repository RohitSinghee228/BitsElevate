import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer, toast } from 'react-toastify';
import { useContext, useEffect, useState } from 'react';

import { UserContext } from "../../UserContext";
import axios from 'axios';

interface Payment {
  transactionId: string;
  date: Date;
  courseId: {
    name: string;
    img: string;
  };
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  status: string;
}

const AllPaymentData = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sortedPayments, setSortedPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundLoading, setRefundLoading] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        // Check if user is admin
        if (!user || user.role !== 'admin') {
          setError("You don't have permission to view payment data. Admin access is required.");
          setLoading(false);
          return;
        }

        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        console.log("Fetching all payment transactions");
        
        let fetchSuccess = false;
        
        // Try the 'all' endpoint first
        try {
          const response = await axios.get(`http://localhost:3001/api/payments/transactions/all`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            timeout: 5000 // Add timeout to prevent long waiting
          });
          
          // Handle both data formats - direct array or nested in data property
          let paymentData = response.data;
          if (response.data && response.data.data) {
            paymentData = response.data.data;
          }
          
          if (Array.isArray(paymentData)) {
            const formattedPayments = paymentData.map((payment: any) => ({
              ...payment,
              date: new Date(payment.date || payment.createdAt || Date.now())
            }));
            
            setPayments(formattedPayments);
            setSortedPayments(formattedPayments);
            fetchSuccess = true;
            console.log("Successfully fetched from /all endpoint:", formattedPayments.length, "transactions");
          } else {
            console.warn("Response from 'all' endpoint was not an array:", paymentData);
          }
        } catch (err: any) {
          console.error("Error fetching from /all endpoint:", err.message);
          
          // Check for authorization errors
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            // If token is invalid or expired
            localStorage.removeItem("token"); // Clear the invalid token
            setError("Your session has expired. Please log in again.");
            setLoading(false);
            return;
          }
        }
        
        // If first attempt failed, try the user-specific endpoint
        if (!fetchSuccess && user.id) {
          try {
            console.log("Falling back to user-specific endpoint with admin ID:", user.id);
            const response = await axios.get(`http://localhost:3001/api/payments/transactions/${user.id}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            
            let paymentData = response.data;
            if (response.data && response.data.data) {
              paymentData = response.data.data;
            }
            
            if (Array.isArray(paymentData)) {
              const formattedPayments = paymentData.map((payment: any) => ({
                ...payment,
                date: new Date(payment.date || payment.createdAt || Date.now())
              }));
              
              setPayments(formattedPayments);
              setSortedPayments(formattedPayments);
              fetchSuccess = true;
              console.log("Successfully fetched from user endpoint:", formattedPayments.length, "transactions");
            } else {
              console.warn("Response from user endpoint was not an array");
            }
          } catch (err: any) {
            console.error("Error in fallback fetch:", err);
            
            // Check for authorization errors in the fallback
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              localStorage.removeItem("token"); // Clear the invalid token
              setError("Your session has expired. Please log in again.");
              setLoading(false);
              return;
            }
          }
        }
        
        // Last resort - show mock data
        if (!fetchSuccess) {
          console.log("All fetch attempts failed, showing mock data");
          toast.warning("Could not fetch real transaction data. Showing example data instead.", {
            position: "top-right",
            autoClose: 5000,
          });
          
          const mockPayments = [
            {
              transactionId: "mock-1",
              date: new Date(),
              courseId: {
                name: "Web Development Bootcamp",
                img: "https://placehold.co/100x100?text=WebDev"
              },
              userId: {
                _id: "user123",
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com"
              },
              amount: 5000, // ₹50.00
              status: "completed"
            },
            {
              transactionId: "mock-2",
              date: new Date(Date.now() - 86400000), // Yesterday
              courseId: {
                name: "Data Science Fundamentals",
                img: "https://placehold.co/100x100?text=DataSci"
              },
              userId: {
                _id: "user456",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane.smith@example.com"
              },
              amount: 7500, // ₹75.00
              status: "completed"
            }
          ];
          
          setPayments(mockPayments);
          setSortedPayments(mockPayments);
        }
      } catch (error: any) {
        console.error("Payment data fetch error:", error);
        setError('Failed to fetch payment data: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    if (token && user) {
      fetchPaymentData();
    } else {
      setLoading(false);
      setError('Authentication required. Please log in with an admin account.');
    }
  }, [token, user]);

  const sortPaymentsByDate = (option: 'latest' | 'oldest' | 'today' | 'thisWeek') => {
    let sortedData = [...payments];
    switch (option) {
      case 'latest':
        sortedData.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
      case 'oldest':
        sortedData.sort((a, b) => a.date.getTime() - b.date.getTime());
        break;
      case 'today':
        sortedData = sortedData.filter((payment) => isToday(payment.date));
        break;
      case 'thisWeek':
        sortedData = sortedData.filter((payment) => isThisWeek(payment.date));
        break;
      default:
        break;
    }
    setSortedPayments(sortedData);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (date: Date) => {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    return date >= firstDayOfWeek;
  };

  const handleRefund = async (userId: string, transactionId: string) => {
    console.log('Refunding transaction:', transactionId);
    console.log('Refunding user:', userId);
    
    setRefundLoading(transactionId);
    
    try {
      const response = await axios.post('http://localhost:3001/api/payments/refund', {
        userId,
        transactionId
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data.data || response.status === 200) {
        const updatedPayments = payments.map(payment =>
          payment.transactionId === transactionId
            ? { ...payment, status: "refunded" }
            : payment
        );
        setPayments(updatedPayments);
        setSortedPayments(updatedPayments);
  
        // Display success toast
        toast.success("Refund processed successfully");
      }
    } catch (error) {
      console.error("Failed to process refund:", error);
      // Display error toast
      toast.error("Failed to process refund");
    } finally {
      setRefundLoading(null);
    }
  };

  // Add a new function to handle login redirect
  const handleLoginRedirect = () => {
    // Navigate to the login page with a return URL
    window.location.href = `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading payment data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          >
            Try Again
          </button>
          {(error.includes("Authentication") || error.includes("session") || error.includes("log in")) && (
            <button 
              onClick={handleLoginRedirect} 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-semibold mb-4">Payment Data</h1>
      <div className="flex space-x-4 mb-4">
        <button onClick={() => sortPaymentsByDate('latest')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">Latest</button>
        <button onClick={() => sortPaymentsByDate('oldest')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">Oldest</button>
        <button onClick={() => sortPaymentsByDate('today')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">Today</button>
        <button onClick={() => sortPaymentsByDate('thisWeek')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">This Week</button>
      </div>
      
      {sortedPayments.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600 text-lg">No payment transactions found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPayments.map((payment) => (
                <tr key={payment.transactionId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.courseId ? payment.courseId.name : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.courseId && payment.courseId.img ? (
                      <img 
                        src={payment.courseId.img} 
                        alt={payment.courseId.name || 'Course'} 
                        className="h-10 w-10 object-cover rounded" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 flex items-center justify-center rounded">
                        <span className="text-xs text-gray-500">No img</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.transactionId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.userId ? `${payment.userId.firstName || ''} ${payment.userId.lastName || ''}`.trim() || 'N/A' : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.userId ? payment.userId.email || 'N/A' : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{(payment.amount / 100).toFixed(2)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    payment.status === 'completed' ? 'text-green-600' : 
                    payment.status === 'refunded' ? 'text-red-600' : 
                    payment.status === 'pending' ? 'text-yellow-600' : 'text-gray-500'
                  }`}>
                    {payment.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.status === 'completed' ? (
                      <button
                        onClick={() => payment.userId && handleRefund(payment.userId._id, payment.transactionId)}
                        disabled={refundLoading === payment.transactionId}
                        className={`px-4 py-2 ${refundLoading === payment.transactionId ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'} text-white rounded focus:outline-none`}
                      >
                        {refundLoading === payment.transactionId ? 'Processing...' : 'Refund'}
                      </button>
                    ) : (
                      <span className="text-gray-400">
                        {payment.status === 'refunded' ? 'Refunded' : 'No actions'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllPaymentData;
