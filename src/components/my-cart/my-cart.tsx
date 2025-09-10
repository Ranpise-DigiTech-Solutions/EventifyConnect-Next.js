"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useAppSelector } from '@/lib/hooks/use-redux-store';
import { useRouter } from 'next/navigation';
import { message } from 'antd'; // For user feedback

// Assuming the LoadingScreen component exists
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
  </div>
);

// Define the shape of a single cart item
interface CartItem {
    _id: string;
    hallName: string;
    city: string;
    price: number;
    bookingStatus: "COMPLETED" | "PENDING" | "UPCOMING" | "CANCELLED";
}

const MyCart = () => {
    // Access user details from the Redux state
    const userDetails = useAppSelector(state => state.userInfo.userDetails);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();

    // Memoized functions for displaying messages
    const displaySuccessMessage = useCallback((content: string) => {
        messageApi.open({ type: 'success', content });
    }, [messageApi]);

    const displayErrorMessage = useCallback((content: string) => {
        messageApi.open({ type: 'error', content });
    }, [messageApi]);

    // Function to fetch cart items from the API
    const fetchCartItems = useCallback(async () => {
        if (!userDetails || !userDetails.uid) {
            setLoading(false);
            return;
        }

        try {
            const response: AxiosResponse<CartItem[]> = await axios.get(
                `/api/routes/cart/getCartItems?customerId=${userDetails.uid}`,
                { withCredentials: true }
            );
            if (Array.isArray(response.data)) {
                setCartItems(response.data);
            } else {
                setCartItems([]);
                displayErrorMessage('Invalid data received from server.');
            }
        } catch (error) {
            console.error('Failed to fetch cart items:', error);
            displayErrorMessage('Failed to load cart items.');
        } finally {
            setLoading(false);
        }
    }, [userDetails, displayErrorMessage]);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    // Function to handle removing an item from the cart
    const handleRemoveItem = async (itemId: string) => {
        setLoading(true);
        try {
            await axios.delete(`/api/routes/cart/removeItem/${itemId}`, {
                withCredentials: true
            });
            displaySuccessMessage('Item removed from cart!');
            fetchCartItems();
        } catch (error) {
            console.error('Failed to remove cart item:', error);
            displayErrorMessage('Failed to remove item.');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle navigating to the checkout page
    const handleCheckout = () => {
        router.push('/checkout');
    };

    // Filter items to find those ready for checkout (status "COMPLETED")
    const checkoutReadyItems = cartItems.filter(item => item.bookingStatus === 'COMPLETED');

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            {contextHolder}
            {/* Main container with a visually relaxing gradient background and padding */}
            <div className="min-h-screen bg-gray-100 p-4 md:p-8">
                <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl">
                    {/* Page title with a prominent purple accent */}
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-[#6A1B9A] font-sans">
                        My Cart
                    </h2>

                    {/* Conditional rendering for an empty cart */}
                    {cartItems.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-xl md:text-2xl font-medium">Your cart is empty.</p>
                        </div>
                    ) : (
                        // List of cart items
                        <ul className="space-y-6">
                            {cartItems.map(item => (
                                <li
                                    key={item._id}
                                    className="bg-gray-50 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm transition-all duration-300 hover:shadow-lg hover:bg-gray-100"
                                >
                                    {/* Item details */}
                                    <div className="flex-grow mb-4 md:mb-0">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{item.hallName}</h3>
                                        <p className="text-gray-600 mt-1">{item.city}</p>
                                        <p className="text-lg font-semibold text-[#6A1B9A] mt-2">${item.price.toFixed(2)}</p>
                                        <p className="text-sm font-medium mt-2">
                                            Status: <span className={`font-bold ${item.bookingStatus === 'COMPLETED' ? 'text-green-500' : 'text-yellow-500'}`}>{item.bookingStatus}</span>
                                        </p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
                                        <button
                                            className="bg-red-500 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-red-600 transition-colors duration-200"
                                            onClick={() => handleRemoveItem(item._id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Checkout Section with a prominent button */}
                    {cartItems.length > 0 && (
                        <div className="mt-8 pt-8 border-t-2 border-gray-200 text-center">
                            <p className="text-gray-600 text-sm mb-4">
                                Only bookings with a status of "COMPLETED" can be checked out.
                            </p>
                            <button
                                className={`w-full py-4 px-6 rounded-full font-bold text-lg text-white transition-all duration-300
                                ${checkoutReadyItems.length === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] hover:from-[#6A1B9A] hover:to-[#5e35b1] shadow-lg'
                                }`}
                                onClick={handleCheckout}
                                disabled={checkoutReadyItems.length === 0}
                            >
                                Proceed to Checkout ({checkoutReadyItems.length} items)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default memo(MyCart);
