"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import axios from 'axios';
import { useAppSelector } from '@/lib/hooks/use-redux-store';
import { message } from 'antd'; // For user feedback
import { User, Lock, Bell, Trash2 } from 'lucide-react'; // Icons from lucide-react

// Assuming a simple LoadingScreen component exists
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
  </div>
);

const SettingsComponent = () => {
    // Access user details from the Redux state
    const userDetails = useAppSelector(state => state.userInfo.userDetails);
    
    // State for loading and user feedback
    const [loading, setLoading] = useState<boolean>(true);
    const [messageApi, contextHolder] = message.useMessage();

    // State for form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [emailNotifications, setEmailNotifications] = useState(true);

    // Memoized functions for displaying messages
    const displaySuccessMessage = useCallback((content: string) => {
        messageApi.open({ type: 'success', content });
    }, [messageApi]);

    const displayErrorMessage = useCallback((content: string) => {
        messageApi.open({ type: 'error', content });
    }, [messageApi]);
    
    // Effect to pre-fill form with user details from Redux
    useEffect(() => {
        if (userDetails && userDetails.uid) {
            // Mock user details based on your provided slice and backend logic
            // In a real app, you would fetch these from a user profile API
            const mockName = userDetails.name || 'John Doe';
            const mockEmail = userDetails.email || 'user@example.com';
            
            setName(mockName);
            setEmail(mockEmail);
            setLoading(false);
        } else {
            // Handle case where user is not logged in
            setLoading(false);
        }
    }, [userDetails]);

    // Function to handle updating profile information
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock API call to update profile
            await axios.put(`/api/routes/user/updateProfile/${userDetails.uid}`, { name, email });
            displaySuccessMessage('Profile updated successfully!');
        } catch (error) {
            displayErrorMessage('Failed to update profile.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle changing password
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            displayErrorMessage('New passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            // Mock API call to change password
            await axios.put(`/api/routes/user/changePassword/${userDetails.uid}`, { currentPassword, newPassword });
            displaySuccessMessage('Password changed successfully!');
            // Clear password fields on success
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            displayErrorMessage('Failed to change password. Please check your current password.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    // Function to handle a mock account deletion
    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
             setLoading(true);
            try {
                // Mock API call to delete account
                await axios.delete(`/api/routes/user/deleteAccount/${userDetails.uid}`);
                displaySuccessMessage('Your account has been successfully deleted.');
                // Redirect user to homepage or logout page
            } catch (error) {
                displayErrorMessage('Failed to delete account.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            {contextHolder}
            {/* Main container with a visually relaxing gray background */}
            <div className="min-h-screen bg-gray-100 p-4 md:p-8">
                <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-[#6A1B9A] font-sans">
                        Settings
                    </h2>

                    {/* Profile Information Section */}
                    <div className="space-y-8">
                        <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center space-x-4 mb-4">
                                <User className="text-[#6A1B9A]" size={24} />
                                <h3 className="text-xl font-bold text-gray-800">Profile Information</h3>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="flex flex-col">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 px-6 bg-[#6A1B9A] text-white font-semibold rounded-full shadow-md hover:bg-[#5e35b1] transition-colors duration-200"
                                >
                                    Update Profile
                                </button>
                            </form>
                        </div>
                        
                        {/* Password Change Section */}
                        <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center space-x-4 mb-4">
                                <Lock className="text-[#6A1B9A]" size={24} />
                                <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
                            </div>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="flex flex-col">
                                    <label htmlFor="current-password" className="text-sm font-medium text-gray-700">Current Password</label>
                                    <input
                                        id="current-password"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="new-password" className="text-sm font-medium text-gray-700">New Password</label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 px-6 bg-[#6A1B9A] text-white font-semibold rounded-full shadow-md hover:bg-[#5e35b1] transition-colors duration-200"
                                >
                                    Change Password
                                </button>
                            </form>
                        </div>

                        {/* Notification Settings Section */}
                        <div className="bg-gray-50 p-6 rounded-xl shadow-sm flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Bell className="text-[#6A1B9A]" size={24} />
                                <h3 className="text-xl font-bold text-gray-800">Email Notifications</h3>
                            </div>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    name="toggle"
                                    id="toggle"
                                    checked={emailNotifications}
                                    onChange={() => setEmailNotifications(!emailNotifications)}
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                />
                                <label
                                    htmlFor="toggle"
                                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                                ></label>
                            </div>
                        </div>

                        {/* Account Actions Section */}
                        <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center space-x-4 mb-4">
                                <Trash2 className="text-red-500" size={24} />
                                <h3 className="text-xl font-bold text-red-500">Account Actions</h3>
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                className="w-full py-3 px-6 bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 transition-colors duration-200"
                            >
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Custom style for the toggle switch */}
            <style jsx>{`
                .toggle-checkbox:checked {
                    right: 0;
                    background-color: #6A1B9A;
                    border-color: #6A1B9A;
                }
                .toggle-checkbox:checked + .toggle-label {
                    background-color: #5e35b1;
                }
                .toggle-checkbox:checked + .toggle-label:before {
                    transform: translateX(1.5rem);
                }
                .toggle-checkbox {
                    transition: right 0.2s ease-in-out;
                }
                .toggle-label {
                    cursor: pointer;
                    display: block;
                    width: 3rem;
                    height: 1.5rem;
                    border-radius: 9999px;
                    background-color: #ddd;
                    position: relative;
                }
                .toggle-label:before {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 1.25rem;
                    height: 1.25rem;
                    background-color: white;
                    border-radius: 9999px;
                    transition: transform 0.2s ease-in-out;
                }
                .toggle-checkbox:checked + .toggle-label {
                    background-color: #6A1B9A;
                }
                .toggle-checkbox:checked + .toggle-label:before {
                    transform: translateX(1.5rem);
                }
            `}</style>
        </>
    );
};

export default memo(SettingsComponent);
