"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import axios, { AxiosResponse } from 'axios';
import Image from 'next/image';
import { useAppSelector } from '@/lib/hooks/use-redux-store';
import { message } from 'antd'; // For user feedback

// Assuming the LoadingScreen component exists
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
  </div>
);

// Define the shape of a single favorite item
interface FavoriteItem {
    _id: string;
    name: string;
    location: string;
    price: number;
    // Using a placeholder image for this example
    imgUrl: string; 
}

const Favorites = () => {
    // Access user details from the Redux state
    const userDetails = useAppSelector(state => state.userInfo.userDetails);
    const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [messageApi, contextHolder] = message.useMessage();

    // Memoized functions for displaying messages
    const displaySuccessMessage = useCallback((content: string) => {
        messageApi.open({ type: 'success', content });
    }, [messageApi]);

    const displayErrorMessage = useCallback((content: string) => {
        messageApi.open({ type: 'error', content });
    }, [messageApi]);

    // Function to fetch favorite items from the API
    const fetchFavoriteItems = useCallback(async () => {
        if (!userDetails || !userDetails.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Mock API call. In a real application, this would fetch data from your backend.
            // The API would need to accept a customerId and return a list of favorite items.
            const response: AxiosResponse<FavoriteItem[]> = await axios.get(
                `/api/routes/favorites/getFavorites?customerId=${userDetails.uid}`,
                { withCredentials: true }
            );

            // Using mock data for demonstration
            const mockData: FavoriteItem[] = [
                { _id: "1", name: "Grand Hall", location: "New York, NY", price: 500, imgUrl: "https://placehold.co/600x400/8e2de2/ffffff?text=Grand+Hall" },
                { _id: "2", name: "Modern Loft", location: "Los Angeles, CA", price: 350, imgUrl: "https://placehold.co/600x400/4a00e0/ffffff?text=Modern+Loft" },
                { _id: "3", name: "Beachside Venue", location: "Miami, FL", price: 750, imgUrl: "https://placehold.co/600x400/6A1B9A/ffffff?text=Beachside+Venue" },
            ];

            // In a real app, you would use response.data
            setFavoriteItems(mockData);

        } catch (error) {
            console.error('Failed to fetch favorite items:', error);
            displayErrorMessage('Failed to load favorite items.');
            setFavoriteItems([]);
        } finally {
            setLoading(false);
        }
    }, [userDetails, displayErrorMessage]);

    useEffect(() => {
        fetchFavoriteItems();
    }, [fetchFavoriteItems]);

    // Function to handle removing an item from the favorites list
    const handleRemoveItem = async (itemId: string) => {
        setLoading(true);
        try {
            // Mock API call for removing an item.
            await axios.delete(`/api/routes/favorites/removeItem/${itemId}`, {
                withCredentials: true
            });
            displaySuccessMessage('Item removed from favorites!');
            // After successful removal, re-fetch the list
            fetchFavoriteItems();
        } catch (error) {
            console.error('Failed to remove favorite item:', error);
            displayErrorMessage('Failed to remove item.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            {contextHolder}
            <div className="min-h-screen bg-gray-100 p-4 md:p-8">
                <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-[#6A1B9A] font-sans">
                        My Favorites
                    </h2>

                    {favoriteItems.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-xl md:text-2xl font-medium">You have no favorite items yet.</p>
                        </div>
                    ) : (
                        <ul className="space-y-6">
                            {favoriteItems.map(item => (
                                <li
                                    key={item._id}
                                    className="bg-gray-50 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-sm transition-all duration-300 hover:shadow-lg hover:bg-gray-100"
                                >
                                    {/* Item Image */}
                                    <div className="relative w-full md:w-32 h-32 mb-4 md:mb-0 md:mr-6 rounded-lg overflow-hidden">
                                        <Image
                                            src={item.imgUrl}
                                            alt={item.name}
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-lg"
                                        />
                                    </div>
                                    
                                    {/* Item Details */}
                                    <div className="flex-grow text-center md:text-left">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{item.name}</h3>
                                        <p className="text-gray-600 mt-1">{item.location}</p>
                                        <p className="text-lg font-semibold text-[#6A1B9A] mt-2">${item.price.toFixed(2)}</p>
                                    </div>

                                    {/* Remove button */}
                                    <div className="mt-4 md:mt-0">
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
                </div>
            </div>
        </>
    );
};

export default memo(Favorites);
