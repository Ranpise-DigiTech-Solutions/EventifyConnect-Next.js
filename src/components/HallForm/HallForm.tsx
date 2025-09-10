import React, { useState, useEffect } from "react";
import BusinessIcon from "@mui/icons-material/Business";
import PlaceIcon from "@mui/icons-material/Place";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import axios from "axios";
import { useAppSelector } from "@/redux/hooks"; // Corrected import for typed hook
import { RootState } from "@/redux/store"; // Retaining this import for RootState type

// Define the types for the props to ensure type safety
interface HallFormProps {
  hallData: {
    _id?: string;
    hallName?: string;
    hallAddress?: string;
    contactNumber?: string;
    hallEmail?: string;
  } | null;
  serviceProviderData: {
    _id?: string;
    businessName?: string;
    businessType?: string;
    address?: string;
    city?: string;
  } | null;
}

export default function HallForm({ hallData, serviceProviderData }: HallFormProps) {
  // Use a loading state to show a message while data is being fetched or saved
  const [loading, setLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  
  // State for the hall form inputs, initialized with prop data
  const [hallForm, setHallForm] = useState({
    hallName: "",
    hallAddress: "",
    contactNumber: "",
    hallEmail: "",
  });

  // State for the service provider form inputs, initialized with prop data
  const [serviceProviderForm, setServiceProviderForm] = useState({
    businessName: "",
    address: "",
    city: "",
  });
  
  // Redux state for user info, assuming it holds the user's ID
  // Using the new typed hook
  const userInfoStore = useAppSelector((state) => state.userInfo);

  // Update form state when props change
  useEffect(() => {
    if (hallData) {
      setHallForm({
        hallName: hallData.hallName || "",
        hallAddress: hallData.hallAddress || "",
        contactNumber: hallData.contactNumber || "",
        hallEmail: hallData.hallEmail || "",
      });
    }
    if (serviceProviderData) {
      setServiceProviderForm({
        businessName: serviceProviderData.businessName || "",
        address: serviceProviderData.address || "",
        city: serviceProviderData.city || "",
      });
    }
  }, [hallData, serviceProviderData]);

  // Handle input changes for the hall form
  const handleHallChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHallForm(prev => ({ ...prev, [name]: value }));
    setFormSuccess(false);
    setFormError("");
  };

  // Handle input changes for the service provider form
  const handleServiceProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServiceProviderForm(prev => ({ ...prev, [name]: value }));
    setFormSuccess(false);
    setFormError("");
  };

  // Handle the form submission to update data
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFormSuccess(false);
    setFormError("");

    try {
      // Logic to update the Hall data
      if (hallData?._id) {
        await axios.put(`/api/routes/hallMaster/${hallData._id}`, hallForm);
      } else {
        // If no hallData exists, create a new one
        await axios.post("/api/routes/hallMaster", { ...hallForm, userId: userInfoStore.userDetails.Document._id });
      }

      // Logic to update the Service Provider data
      if (serviceProviderData?._id) {
        await axios.put(`/api/routes/serviceProviderMaster/${serviceProviderData._id}`, serviceProviderForm);
      } else {
        // If no serviceProviderData exists, create a new one
        await axios.post("/api/routes/serviceProviderMaster", { ...serviceProviderForm, userId: userInfoStore.userDetails.Document._id });
      }

      setLoading(false);
      setFormSuccess(true);
      setFormError("");
      console.log("Business details updated successfully!");

    } catch (error) {
      setLoading(false);
      setFormSuccess(false);
      setFormError("Failed to update business details. Please try again.");
      console.error("Failed to update business details", error);
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-center text-blue-400">Your Business Details</h1>
      
      {loading && (
        <div className="text-center py-4">
          <p>Saving changes...</p>
        </div>
      )}

      {formSuccess && (
        <div className="bg-green-600 text-white p-4 rounded-xl text-center my-4 transition-all duration-300">
          <p>Details updated successfully! 🎉</p>
        </div>
      )}

      {formError && (
        <div className="bg-red-600 text-white p-4 rounded-xl text-center my-4 transition-all duration-300">
          <p>{formError}</p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="flex flex-col md:flex-row gap-6">
        {/* Hall Form Section */}
        <div className="bg-gray-700 p-6 rounded-3xl shadow-lg w-full md:w-1/2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BusinessIcon className="text-blue-400" /> Banquet Hall Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Hall Name</label>
              <div className="flex items-center bg-gray-600 rounded-xl px-3 py-2">
                <DriveFileRenameOutlineIcon className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="hallName"
                  value={hallForm.hallName}
                  onChange={handleHallChange}
                  className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-white"
                  placeholder="Enter hall name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Hall Address</label>
              <div className="flex items-center bg-gray-600 rounded-xl px-3 py-2">
                <PlaceIcon className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="hallAddress"
                  value={hallForm.hallAddress}
                  onChange={handleHallChange}
                  className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-white"
                  placeholder="Enter hall address"
                />
              </div>
            </div>
            {/* Additional fields like contactNumber and hallEmail can be added here */}
          </div>
        </div>
        
        {/* Service Provider Form Section */}
        <div className="bg-gray-700 p-6 rounded-3xl shadow-lg w-full md:w-1/2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BusinessIcon className="text-blue-400" /> Service Provider Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Business Name</label>
              <div className="flex items-center bg-gray-600 rounded-xl px-3 py-2">
                <DriveFileRenameOutlineIcon className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="businessName"
                  value={serviceProviderForm.businessName}
                  onChange={handleServiceProviderChange}
                  className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-white"
                  placeholder="Enter business name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
              <div className="flex items-center bg-gray-600 rounded-xl px-3 py-2">
                <PlaceIcon className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="city"
                  value={serviceProviderForm.city}
                  onChange={handleServiceProviderChange}
                  className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-white"
                  placeholder="Enter city"
                />
              </div>
            </div>
            {/* Additional fields like address can be added here */}
          </div>
        </div>
      </form>

      {/* Save button outside of form sections but part of the form */}
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          form="hall-form"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}