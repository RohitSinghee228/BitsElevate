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
          setError("You don't have permission to view payment data");
          setLoading(false);
          return;
        }

        // For admin users, we should get all transactions
        // First check if the user ID is defined
        if (!user.id) {
          setError("User ID is undefined");
          setLoading(false);
          return;
        }

        try {
          // Get the specific transactions for the current user (admin)
          const response = await axios.get(`http://localhost:3001/api/payments/transactions/${user.id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
          // Handle both data formats - direct array or nested in data property
          let paymentData = response.data;
          if (response.data && response.data.data) {
            paymentData = response.data.data;
          }
          
          const formattedPayments = Array.isArray(paymentData) 
            ? paymentData.map((payment: Payment) => ({
                ...payment,
                date: new Date(payment.date)
              })) 
            : [];
          
          setPayments(formattedPayments);
          setSortedPayments(formattedPayments);
        } catch (error) {
          console.error("Error fetching user transactions:", error);
          
          // For development only - if no transactions exist, show mock data
          // Remove this in production
          const mockPayments = [
            {
              transactionId: "mock-1",
              date: new Date(),
              courseId: {
                name: "Sample Course 1",
                img: "https://via.placeholder.com/150"
              },
              userId: {
                _id: user.id,
                firstName: "Sample",
                lastName: "User",
                email: "sample@example.com"
              },
              amount: 5000, // $50.00
              status: "completed"
            },
            {
              transactionId: "mock-2",
              date: new Date(Date.now() - 86400000), // Yesterday
              courseId: {
                name: "Sample Course 2",
                img: "https://via.placeholder.com/150"
              },
              userId: {
                _id: user.id,
                firstName: "Sample",
                lastName: "User",
                email: "sample@example.com"
              },
              amount: 7500, // $75.00
              status: "completed"
            }
          ];
          
          setPayments(mockPayments);
          setSortedPayments(mockPayments);
        }
      } catch (error) {
        setError('Failed to fetch payment data');
        console.error("Payment data fetch error:", error);
        setLoading(false);
      }
    };
    
    if (token && user) {
      fetchPaymentData();
    }
  }, [token, user]);

  console.log(payments);

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
    console.log('Refunding token:', token);
  
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
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Payment Data</h1>
      <div className="flex space-x-4 mb-4">
        <button onClick={() => sortPaymentsByDate('latest')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">Latest</button>
        <button onClick={() => sortPaymentsByDate('oldest')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">Oldest</button>
        <button onClick={() => sortPaymentsByDate('today')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">Today</button>
        <button onClick={() => sortPaymentsByDate('thisWeek')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">This Week</button>
      </div>
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
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><img src={payment.courseId ? payment.courseId.img : ''} alt={payment.courseId ? payment.courseId.name : ''} className="h-10 w-10 object-cover" /></td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.transactionId}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.userId ? `${payment.userId.firstName} ${payment.userId.lastName}` : 'N/A'}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.userId ? payment.userId.email : 'N/A'}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.amount / 100}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.status}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {payment.status !== 'refunded' ? (
        <button
          onClick={() => handleRefund(payment.userId._id, payment.transactionId)}
          disabled={refundLoading === payment.transactionId}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
        >
          {refundLoading === payment.transactionId ? 'Processing...' : 'Refund'}
        </button>
      ) : (
        'Refunded'
      )}
    </td>
  </tr>
))}

          </tbody>
        </table>
      </div>
      <ToastContainer />

    </div>
  );
};

export default AllPaymentData;
