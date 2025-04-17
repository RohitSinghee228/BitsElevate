import 'react-toastify/dist/ReactToastify.css';

import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

import Loader from '../components/Loader';
import { UserContext } from '../UserContext';
import { useContext } from 'react';

export default function Payment() {
  const { id, price, userId } = useParams<{ id: string; userId: string; price: string }>();
  const [courseData, setCourseData] = useState<any>({});
  const [paymentData, setPaymentData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Fetch course data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseResponse = await fetch(`http://localhost:7071/api/courseManagement/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const courseData = await courseResponse.json();
        setCourseData(courseData.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Fetch payment data (card details)
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        console.log('Fetching payment data for userId:', userId);
        const response = await fetch(
          `http://localhost:7072/api/paymentMangement/get-card?userId=${userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        console.log('Payment data response status:', response.status);
        const data = await response.json();
        console.log('Received payment data:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch payment data');
        }

        if (data.status === 'error') {
          if (data.code === 'CARD_NOT_FOUND') {
            setPaymentData(null);
            toast.info('No card details found. Please add a card to proceed.');
            return;
          }
          throw new Error(data.message || 'Failed to fetch payment data');
        }

        // Handle both direct data and nested data structure
        const cardData = data.data || data;
        if (cardData) {
          setPaymentData({
            brand: cardData.brand,
            last4: cardData.last4,
            exp_month: cardData.exp_month,
            exp_year: cardData.exp_year
          });
        } else {
          setPaymentData(null);
          toast.info('No card details found. Please add a card to proceed.');
        }
      } catch (error) {
        console.error('Error fetching payment data:', error);
        toast.error('Failed to fetch payment data');
      }
    };

    if (userId) {
      fetchPaymentData();
    }
  }, [userId]);

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!paymentData) {
      toast.error('Please add a payment method before proceeding');
      return;
    }

    try {
      setCheckoutLoading(true);

      const paymentResponse = await fetch('http://localhost:7072/api/paymentMangement/saveTansaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          amount: price,
          courseId: id,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to save transaction');
      }

      const paymentData = await paymentResponse.json();

      const enrollResponse = await fetch('http://localhost:7071/api/courseManagement/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          courseId: id,
          userId: user?.id,
          transactionId: paymentData.data._id,
        }),
      });

      if (enrollResponse.ok) {
        toast.success('Successfully enrolled in the course');
        setTimeout(() => {
          navigate('/user-profile');
        }, 2000);
      } else {
        throw new Error('Failed to enroll in the course');
      }
    } catch (error) {
      console.error('Error handling payment:', error);
      toast.error('Error handling payment');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="">
      {loading ? (
        <Loader />
      ) : (
        <form className="flex py-16 justify-center max-w-3xl mx-auto" onSubmit={handlePayment}>
          {/* Payment Method Section */}
          <div className="flex-2 flex shadow-xl flex-col">
            <div className="border border-gray-300 p-4 mt-4">
              <h1 className="font-bold text-lg">Payment Method</h1>
              {paymentData ? (
                <div className="flex flex-col mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-500">Card Type:</span>
                    <span className="font-semibold">{paymentData.brand}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-500">Card Number:</span>
                    <span className="font-semibold">**** **** **** {paymentData.last4}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Expiry Date:</span>
                    <span className="font-semibold">{paymentData.exp_month}/{paymentData.exp_year}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-red-500">No payment method found</p>
                  <button
                    type="button"
                    onClick={() => navigate('/user-profile')}
                    className="mt-2 text-blue-500 hover:text-blue-700"
                  >
                    Add Payment Method
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Course Details Section */}
          <div className="flex-1 shadow-2xl flex flex-col justify-between p-4 border border-gray-300 mx-8 bg-blue-100">
            <div className="mb-4">
              <img
                src={courseData.img}
                alt={courseData.name}
                style={{ width: '100%', marginBottom: '8px', display: imageLoading ? 'none' : 'block' }}
                onLoad={() => setImageLoading(false)}
              />
              {imageLoading && <Loader />}
              <h2 className="font-mono text-xl font-semibold text-gray-700">{courseData.name}</h2>
              <p className="font-mono font-semibold text-gray-500">Discount: 0%</p>
            </div>
            <div className="mb-4">
              <p className="font-mono font-semibold text-red-500">Total: RS.{courseData.price}</p>
            </div>
            <div>
              <p>By continuing, you agree to the terms of service.</p>
            </div>
            <button 
              className="bg-blue-400 hover:bg-blue-500 text-white py-2 mt-4" 
              type="submit" 
              disabled={checkoutLoading || !paymentData}
            >
              {checkoutLoading ? 'Completing Checkout...' : 'Complete Checkout'}
            </button>
          </div>
        </form>
      )}
      <ToastContainer />
    </div>
  );
}
