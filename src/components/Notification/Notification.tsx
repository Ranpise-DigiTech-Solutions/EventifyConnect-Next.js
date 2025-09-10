"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useAppSelector } from '@/lib/hooks/use-redux-store';
import { message } from 'antd'; // For user feedback
import { Bell, Mail, CheckCircle } from 'lucide-react'; // Icons from lucide-react

// Assuming the LoadingScreen component exists
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
  </div>
);

// Define the shape of a single notification item
interface NotificationItem {
    _id: string;
    message: string;
    timestamp: string;
    isRead: boolean;
}

const Notification = () => {
    // Access user details from the Redux state
    const userDetails = useAppSelector(state => state.userInfo.userDetails);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [messageApi, contextHolder] = message.useMessage();

    // Memoized functions for displaying messages
    const displaySuccessMessage = useCallback((content: string) => {
        messageApi.open({ type: 'success', content });
    }, [messageApi]);

    const displayErrorMessage = useCallback((content: string) => {
        messageApi.open({ type: 'error', content });
    }, [messageApi]);

    // Function to fetch notifications from the API
    const fetchNotifications = useCallback(async () => {
        if (!userDetails || !userDetails.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Mock API call. In a real application, this would fetch data from your backend.
            const response: AxiosResponse<NotificationItem[]> = await axios.get(
                `/api/routes/notifications/getNotifications?customerId=${userDetails.uid}`,
                { withCredentials: true }
            );

            // Using mock data for demonstration
            const mockData: NotificationItem[] = [
                { _id: "1", message: "Your booking for 'Grand Hall' has been confirmed.", timestamp: "2024-08-14T10:00:00Z", isRead: false },
                { _id: "2", message: "You have a new message from 'Modern Loft' venue.", timestamp: "2024-08-13T15:30:00Z", isRead: false },
                { _id: "3", message: "Your payment for 'Beachside Venue' has been received.", timestamp: "2024-08-12T09:15:00Z", isRead: true },
            ];
            
            // In a real app, you would use response.data
            setNotifications(mockData);

        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            displayErrorMessage('Failed to load notifications.');
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [userDetails, displayErrorMessage]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Function to mark a notification as read
    const handleMarkAsRead = async (notificationId: string) => {
        setLoading(true);
        try {
            // Mock API call to update the notification status
            await axios.patch(`/api/routes/notifications/markAsRead/${notificationId}`, {
                withCredentials: true
            });
            displaySuccessMessage('Notification marked as read.');
            // After successful update, re-fetch the list
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            displayErrorMessage('Failed to update notification.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    // Filter notifications to show unread first
    const sortedNotifications = [...notifications].sort((a, b) => {
        if (a.isRead === b.isRead) return 0;
        return a.isRead ? 1 : -1;
    });

    return (
        <>
            {contextHolder}
            <div className="min-h-screen bg-gray-100 p-4 md:p-8">
                <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-[#6A1B9A] font-sans">
                        Notifications
                    </h2>

                    {notifications.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-xl md:text-2xl font-medium">You have no new notifications.</p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {sortedNotifications.map(item => (
                                <li
                                    key={item._id}
                                    className={`p-6 rounded-xl flex items-center shadow-sm transition-all duration-300
                                        ${item.isRead ? 'bg-gray-100' : 'bg-[#f3e5f5] hover:bg-[#e1bee7]'}
                                    `}
                                >
                                    {/* Icon based on read status */}
                                    <div className={`flex-shrink-0 mr-4 ${item.isRead ? 'text-gray-400' : 'text-[#6A1B9A]'}`}>
                                        {item.isRead ? <CheckCircle size={24} /> : <Mail size={24} />}
                                    </div>
                                    
                                    {/* Notification message */}
                                    <div className="flex-grow">
                                        <p className={`text-base md:text-lg font-medium ${item.isRead ? 'text-gray-500' : 'text-gray-800'}`}>
                                            {item.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Action button */}
                                    {!item.isRead && (
                                        <button
                                            className="bg-[#6A1B9A] text-white font-semibold py-2 px-4 rounded-full text-sm md:text-base shadow-md hover:bg-[#5e35b1] transition-colors duration-200 ml-4"
                                            onClick={() => handleMarkAsRead(item._id)}
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};

export default memo(Notification);
