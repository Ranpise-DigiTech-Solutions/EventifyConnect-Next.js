"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import axios, { AxiosResponse } from 'axios';
import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks/use-redux-store';
import { message } from 'antd'; // For user feedback
import { CalendarDays, Clock, BellRing, SquarePen, ShoppingCart } from 'lucide-react'; // Icons from lucide-react

// Assuming a simple LoadingScreen component exists
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
  </div>
);

// Define the shape of data for the dashboard
interface UpcomingBooking {
    _id: string;
    hallName: string;
    date: string;
    time: string;
}

interface RecentActivity {
    _id: string;
    message: string;
    timestamp: string;
}

// Define the props for the Dashboard component
interface DashboardProps {
    setActiveComponent: (componentName: string) => void;
}

const Dashboard = ({ setActiveComponent }: DashboardProps) => {
    // Access user details from the Redux state
    const userDetails = useAppSelector(state => state.userInfo.userDetails);
    
    // State for dashboard data and loading status
    const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [messageApi, contextHolder] = message.useMessage();

    // Memoized function for displaying error messages
    const displayErrorMessage = useCallback((content: string) => {
        messageApi.open({ type: 'error', content });
    }, [messageApi]);

    // Function to fetch all dashboard data
    const fetchDashboardData = useCallback(async () => {
        if (!userDetails || !userDetails.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Mock API calls to fetch dashboard data.
            // In a real application, these would be separate endpoints.
            const [bookingsRes, activityRes] = await Promise.all([
                axios.get(`/api/routes/dashboard/upcomingBookings?customerId=${userDetails.uid}`, { withCredentials: true }),
                axios.get(`/api/routes/dashboard/recentActivity?customerId=${userDetails.uid}`, { withCredentials: true })
            ]);

            // Using mock data for demonstration purposes
            const mockBookings: UpcomingBooking[] = [
                { _id: "1", hallName: "Grand Ballroom", date: "2024-09-15", time: "19:00" },
                { _id: "2", hallName: "Conference Hall B", date: "2024-10-01", time: "10:30" },
            ];
            
            const mockActivity: RecentActivity[] = [
                { _id: "1", message: "Your booking for 'Grand Ballroom' has been confirmed.", timestamp: "2024-08-14T10:00:00Z" },
                { _id: "2", message: "You added 'Modern Loft' to your cart.", timestamp: "2024-08-13T15:30:00Z" },
                { _id: "3", message: "A new message from 'Conference Hall B' venue.", timestamp: "2024-08-12T09:15:00Z" },
            ];

            setUpcomingBookings(mockBookings);
            setRecentActivity(mockActivity);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            displayErrorMessage('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }, [userDetails, displayErrorMessage]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            {contextHolder}
            <div className="min-h-screen bg-gray-100 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#6A1B9A] font-sans mb-8">
                        Hello, {userDetails?.name || 'Guest'}
                    </h2>
                    
                    {/* Main Grid for Dashboard Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Upcoming Bookings Card */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl">
                            <div className="flex items-center space-x-4 mb-4">
                                <CalendarDays className="text-[#6A1B9A]" size={24} />
                                <h3 className="text-2xl font-bold text-gray-800">Upcoming Bookings</h3>
                            </div>
                            {upcomingBookings.length > 0 ? (
                                <ul className="space-y-4">
                                    {upcomingBookings.map(booking => (
                                        <li key={booking._id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between shadow-sm">
                                            <div>
                                                <p className="font-semibold text-lg text-gray-800">{booking.hallName}</p>
                                                <p className="text-sm text-gray-500 mt-1">{booking.date} at {booking.time}</p>
                                            </div>
                                            <Link href={`/bookings/${booking._id}`} className="text-[#6A1B9A] hover:underline text-sm font-medium">View Details</Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 p-10">No upcoming bookings.</p>
                            )}
                        </div>

                        {/* Recent Activity Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl">
                            <div className="flex items-center space-x-4 mb-4">
                                <BellRing className="text-[#6A1B9A]" size={24} />
                                <h3 className="text-2xl font-bold text-gray-800">Recent Activity</h3>
                            </div>
                            {recentActivity.length > 0 ? (
                                <ul className="space-y-4">
                                    {recentActivity.map(activity => (
                                        <li key={activity._id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                                            <p className="text-sm text-gray-800">{activity.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 p-10">No recent activity.</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions Section */}
                    <div className="mt-8 bg-white p-6 rounded-2xl shadow-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/" passHref>
                                <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 shadow-sm hover:bg-[#f3e5f5] transition-colors duration-200 cursor-pointer">
                                    <SquarePen className="text-[#6A1B9A]" size={24} />
                                    <span className="font-semibold text-lg text-gray-800">Book a New Hall</span>
                                </div>
                            </Link>
                            {/* Corrected component call with onClick handler */}
                            <div 
                                onClick={() => setActiveComponent("Cart")}
                                className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 shadow-sm hover:bg-[#f3e5f5] transition-colors duration-200 cursor-pointer"
                            >
                                <ShoppingCart className="text-[#6A1B9A]" size={24} />
                                <span className="font-semibold text-lg text-gray-800">View My Cart</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default memo(Dashboard);
