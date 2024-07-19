// import React, { useState, useEffect, useRef } from 'react'
// import { FaClock } from "react-icons/fa";
// import Chart from "chart.js/auto";
// import axios from "axios";
// import { useAppSelector } from "@/lib/hooks/use-redux-store";

// import "bootstrap/dist/css/bootstrap.min.css";
// import styles from './dashboard.module.scss';
// import { RootState } from '@/redux/store';

// type Props = {}

// const DashboardContainer = (props: Props) => {
//     const chartRef = useRef(null);
//     const bookingChartRef = useRef(null);
//     const analyticsCurveRef = useRef(null);
//     const [analyticsData, setAnalyticsData] = useState(null);
//     const [upcomingEvents, setUpcomingEvents] = useState([]);
//     const [bookingConfirmed, setBookingConfirmed] = useState([]);
//     const userInfoStore = useAppSelector((state: RootState) => state.userInfo);
//     const userVisits = JSON.parse(sessionStorage.getItem("userVisits") || "");
//     const userType = userInfoStore.userDetails.userType; // ADMIN
  
//     const [topLocations, setTopLocations] = useState([]);
  
//     const fetchAnalyticsData = async () => {
//       try {
//         const urls = [
//           "https://chatbot-5f9b6-default-rtdb.firebaseio.com/Users.json",
//           `/api/routes/bookingMaster/`,
//           `/api/routes/hallBookingMaster/`,
//           `/api/routes/hallMaster/`,
//           `/api/routes/vendorMaster/`,
//         ];
  
//         const [
//           customerResponse,
//           bookingRequest,
//           bookingConfirmed,
//           halls,
//           vendors,
//         ] = await Promise.all(urls.map((url) => axios.get(url)));
  
//         if (userType === "ADMIN") {
//           // Extracting the total number of users from the response data
//           const totalUsers = Object.keys(customerResponse.data).length;
//           const pendingBookings = countPendingBookings(bookingRequest.data);
//           const canceledBookings = countCanceledBookings(bookingRequest.data);
//           const confirmedBookings = bookingConfirmed.data.length;
  
//           const totalBookings =
//             pendingBookings + confirmedBookings + canceledBookings;
//           const totalHalls = halls.data.length;
//           const totalVendors = vendors.data.length;
  
//           // Set analytics data including total users
//           const pendingCustomerIds = bookingRequest.data.map(
//             (booking: { customerId: string }) => booking.customerId
//           );
//           const confirmedCustomerIds = bookingConfirmed.data.map(
//             (booking: { customerId: string }) => booking.customerId
//           );
//           const pendingCustomerData = await fetchCustomerData(pendingCustomerIds);
//           const confirmedCustomerData = await fetchCustomerData(
//             confirmedCustomerIds
//           );
  
//           const confirmedLocations = aggregateLocations(
//             pendingCustomerData,
//             "customerCurrentLocation"
//           );
//           const pendingLocations = aggregateLocations(
//             confirmedCustomerData,
//             "customerCurrentLocation"
//           );
  
//           const combinedLocations = combineLocations(
//             confirmedLocations,
//             pendingLocations
//           );
//           setTopLocations(combinedLocations);
//           const vendorRegistrations = [];
//           const customerRegistrations = [];
//           const currentYear = new Date().getFullYear(); // Get the current year
  
//           // Filter data for only the current year
//           const filteredCustomerRegistrations = Object.values(
//             customerResponse.data
//           ).filter(
//             (user) => new Date(user.registered_date).getFullYear() === currentYear
//           );
  
//           for (const user of Object.values(filteredCustomerRegistrations)) {
//             if (user.userType === "VENDOR") {
//               vendorRegistrations.push(new Date(user.registered_date).getMonth());
//             } else if (user.userType === "CUSTOMER") {
//               customerRegistrations.push(
//                 new Date(user.registered_date).getMonth()
//               );
//             }
//           }
  
//           const vendorRegistrationsByMonth = {};
//           for (const month of vendorRegistrations) {
//             vendorRegistrationsByMonth[month] =
//               (vendorRegistrationsByMonth[month] || 0) + 1;
//           }
  
//           const customerRegistrationsByMonth = {};
//           for (const month of customerRegistrations) {
//             customerRegistrationsByMonth[month] =
//               (customerRegistrationsByMonth[month] || 0) + 1;
//           }
  
//           setAnalyticsData({
//             totalUsers,
//             totalBookings,
//             canceledBookings,
//             pendingBookings,
//             confirmedBookings,
//             totalVendors,
//             totalHalls,
//             vendorRegistrationsByMonth,
//             customerRegistrationsByMonth,
//           });
//         } else if (userType === "VENDOR") {
//           // Logic for fetching data for VENDOR id
//           const userId = userInfoStore.userDetails.Document._id;
//           //  console.log(userId);
//           // Filter bookings based on vendor's id
//           const vendorpendingBookingsdata = bookingRequest.data.filter(
//             (booking) =>
//               booking.hallUserId === userId &&
//               (booking.bookingStatus == "PENDING" ||
//                 booking.bookingStatus === "ONHOLD")
//           );
//           const vendorcanceledBookingsdata = bookingRequest.data.filter(
//             (booking) =>
//               booking.hallUserId === userId && booking.bookingStatus == "REJECTED"
//           );
  
//           const vendorConfirmedBookingsdata = bookingConfirmed.data.filter(
//             (booking) => booking.hallUserId === userId
//           );
//           setBookingConfirmed(vendorConfirmedBookingsdata);
//           const vendorPendingBookings = vendorpendingBookingsdata.length;
//           const vendorCanceledBookings = vendorcanceledBookingsdata.length;
//           const vendorConfirmedBookings = vendorConfirmedBookingsdata.length;
  
//           const vendorTotalBookings =
//             vendorPendingBookings +
//             vendorConfirmedBookings +
//             vendorCanceledBookings;
  
//           // Set analytics data for VENDOR
//           setAnalyticsData({
//             totalBookings: vendorTotalBookings,
//             canceledBookings: vendorCanceledBookings,
//             pendingBookings: vendorPendingBookings,
//             confirmedBookings: vendorConfirmedBookings,
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching analytics data:", error);
//         // Handle error
//       }
//     };
  
//     // Function to count pending bookings with status "PENDING"
//     function countPendingBookings(bookings) {
//       let count = 0;
//       for (const booking of bookings) {
//         if (
//           booking.bookingStatus === "PENDING" ||
//           booking.bookingStatus === "ONHOLD"
//         ) {
//           count++;
//         }
//       }
//       return count;
//     }
  
//     // Function to count canceled bookings with status "REJECTED" or "CANCELED"
//     function countCanceledBookings(bookings) {
//       let count = 0;
//       for (const booking of bookings) {
//         if (booking.bookingStatus === "REJECTED") {
//           count++;
//         }
//       }
//       return count;
//     }
//     const fetchCustomerData = async (customerIds) => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_SERVER_URL}/eventify_server/customerMaster/`
//         );
//         const allCustomerData = response.data;
  
//         // Filter customer data based on the provided customerIds
//         const uniqueCustomerIds = Array.from(new Set(customerIds));
//         const filteredCustomerData = allCustomerData.filter((customer) =>
//           uniqueCustomerIds.includes(customer._id)
//         );
  
//         return filteredCustomerData;
//       } catch (error) {
//         console.error("Error fetching customer data:", error);
//         // Handle error
//         return [];
//       }
//     };
  
//     function aggregateLocations(bookings, locationKey) {
//       return bookings.reduce((acc, booking) => {
//         const location = booking[locationKey]; // Assuming the field name is 'hallCity'
//         acc[location] = (acc[location] || 0) + 1;
//         return acc;
//       }, {});
//     }
  
//     function combineLocations(confirmed, pending) {
//       const combined = { ...confirmed };
//       for (const [location, count] of Object.entries(pending)) {
//         combined[location] = (combined[location] || 0) + count;
//       }
//       return Object.entries(combined).map(([location, bookings]) => ({
//         location,
//         bookings,
//       }));
//     }
//     useEffect(() => {
//       fetchAnalyticsData();
//     }, [userInfoStore.userDetails]);
  
//     useEffect(() => {
//       if (chartRef.current && userVisits) {
//         const months = Array.from({ length: 12 }, (_, i) => i + 1); // Generate labels for all 12 months
//         const monthsInString = [
//           "Jan",
//           "Feb",
//           "Mar",
//           "Apr",
//           "May",
//           "Jun",
//           "Jul",
//           "Aug",
//           "Sep",
//           "Oct",
//           "Nov",
//           "Dec",
//         ]; // Array of full month names
  
//         const labels = monthsInString;
//         //   const labels = months.map(month => month.toString());
  
//         const data = months.map((month) => userVisits[month] || 0); // Fill in visit counts, defaulting to 0 if not available
  
//         const chrt = chartRef.current.getContext("2d");
//         const myChart = new Chart(chrt, {
//           type: "bar",
//           data: {
//             labels: labels,
//             datasets: [
//               {
//                 label: "User Visits",
//                 data: data,
//                 backgroundColor: "rgba(54, 162, 235, 0.2)",
//                 borderColor: "rgba(54, 162, 235, 1)",
//                 borderWidth: 1,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             plugins: {
//               title: {
//                 display: true,
//                 text: `${new Date().getFullYear()}`, // Set year as title
//                 font: {
//                   size: 18,
//                   weight: "bold",
//                 },
//               },
//             },
//           },
//         });
  
//         return () => {
//           myChart.destroy();
//         };
//       }
//     }, [userVisits]);
  
//     useEffect(() => {
//       if (bookingChartRef.current && analyticsData) {
//         const chrt = bookingChartRef.current.getContext("2d");
//         if (analyticsData.totalBookings === 0) {
//           chrt.clearRect(
//             0,
//             0,
//             bookingChartRef.current.width,
//             bookingChartRef.current.height
//           );
//           chrt.font = "20px Arial";
//           chrt.textAlign = "center";
//           chrt.fillText(
//             "No data available",
//             bookingChartRef.current.width / 2,
//             bookingChartRef.current.height / 2
//           );
//         } else {
//           const myChart = new Chart(chrt, {
//             type: "pie",
//             data: {
//               labels: [
//                 "Confirmed Bookings",
//                 "Pending Bookings",
//                 "Canceled Bookings",
//               ],
//               datasets: [
//                 {
//                   data: [
//                     analyticsData.confirmedBookings,
//                     analyticsData.pendingBookings,
//                     analyticsData.canceledBookings,
//                   ], // Access confirmedBookings, pendingBookings, and canceledBookings from analyticsData
//                   backgroundColor: ["green", "yellow", "red"],
//                 },
//               ],
//             },
//             options: {
//               responsive: false,
//             },
//           });
  
//           return () => {
//             myChart.destroy();
//           };
//         }
//       }
//     }, [analyticsData]);
  
//     useEffect(() => {
//       if (analyticsCurveRef.current && analyticsData) {
//         // const months = Array.from({ length: 12 }, (_, i) => i + 1); // Generate labels for all 12 months
//         const monthsInString = [
//           "Jan",
//           "Feb",
//           "Mar",
//           "Apr",
//           "May",
//           "Jun",
//           "Jul",
//           "Aug",
//           "Sep",
//           "Oct",
//           "Nov",
//           "Dec",
//         ]; // Array of full month names
  
//         const labels = monthsInString;
//         const vendorRegistrationsByMonth = Array.from({ length: 12 }, () => 0); // Initialize array for vendor registrations by month
//         const customerRegistrationsByMonth = Array.from({ length: 12 }, () => 0); // Initialize array for customer registrations by month
  
//         Object.entries(analyticsData.vendorRegistrationsByMonth).forEach(
//           ([month, count]) => {
//             vendorRegistrationsByMonth[month - 1] = count; // Populate vendor registrations array
//           }
//         );
  
//         Object.entries(analyticsData.customerRegistrationsByMonth).forEach(
//           ([month, count]) => {
//             customerRegistrationsByMonth[month - 1] = count; // Populate customer registrations array
//           }
//         );
  
//         const chrt = analyticsCurveRef.current.getContext("2d");
//         const myChart = new Chart(chrt, {
//           type: "line",
//           data: {
//             labels: labels, //0. Use generated months as labels
//             datasets: [
//               {
//                 label: "Vendors",
//                 data: vendorRegistrationsByMonth,
//                 fill: false,
//                 borderColor: "green",
//                 borderWidth: 2,
//               },
//               {
//                 label: "Customers",
//                 data: customerRegistrationsByMonth,
//                 fill: false,
//                 borderColor: "blue",
//                 borderWidth: 2,
//               },
//             ],
//           },
//           options: {
//             responsive: false,
//             tension: 0.5,
//             plugins: {
//               title: {
//                 display: true,
//                 text: ` ${new Date().getFullYear()}`, // Show current year in the chart's title
//                 padding: {
//                   top: 10,
//                   bottom: 30,
//                 },
//                 font: {
//                   size: 18,
//                   weight: "bold",
//                 },
//               },
//             },
//           },
//         });
  
//         return () => {
//           myChart.destroy();
//         };
//       }
//     }, [analyticsData]);
  
//     useEffect(() => {
//       if (bookingConfirmed.length > 0) {
//         fetchUpcomingEvents();
//       }
//     }, [bookingConfirmed]);
  
//     const calculatePercentages = () => {
//       const totalBookings = topLocations.reduce(
//         (acc, location) => acc + location.bookings,
//         0
//       );
//       return topLocations.map((location) => ({
//         location: location.location,
//         percentage: ((location.bookings / totalBookings) * 100).toFixed(2),
//       }));
//     };
  
//     const renderTopLocationsCards = () => {
//       if (!topLocations.length) return;
  
//       const percentages = calculatePercentages();
//       let top_loc;
  
//       if (userType === "ADMIN") {
//         top_loc = percentages.slice(0, 3); // Assign top 3 locations for ADMIN
//       } else if (userType === "VENDOR") {
//         top_loc = percentages.slice(0, 4); // Assign top 5 locations for VENDOR
//       }
//       const otherPercentages = percentages.slice(3);
//       const otherPercentage = otherPercentages
//         .reduce((acc, loc) => acc + parseFloat(loc.percentage), 0)
//         .toFixed(2);
  
//       return (
//         <>
//           {top_loc.map((location, index) => (
//             <div className="analytics-item" key={index}>
//               <div className="location-info">
//                 <h2>{location.location}</h2>
//               </div>
//               <div className="percentage">
//                 <p>{location.percentage}%</p>
//               </div>
//             </div>
//           ))}
//           {otherPercentage > 0 && (
//             <div className="analytics-item" key="other">
//               <div className="location-info">
//                 <h2>Other</h2>
//               </div>
//               <div className="percentage">
//                 <p>{otherPercentage}%</p>
//               </div>
//             </div>
//           )}
//         </>
//       );
//     };
  
//     const fetchUpcomingEvents = async () => {
//       const currentDate = new Date();
//       const upcomingEventsData = bookingConfirmed.filter(
//         (booking) => new Date(booking.bookingStartDateTimestamp) > currentDate
//       );
//       console.log(upcomingEventsData);
//       for (const booking of upcomingEventsData) {
//         const eventTypeResponse = await axios.get(
//           `${
//             import.meta.env.VITE_SERVER_URL
//           }/eventify_server/eventTypes/getEventName/${booking.eventId}`
//         );
  
//         const eventType = eventTypeResponse.data;
//         booking.eventType = eventType.eventName; // Assuming name is the property for event type
//       }
//       const upcomingEventsFormatted = upcomingEventsData.map((booking) => ({
//         id: booking._id,
//         title: booking.eventType,
//         date: new Date(booking.bookingStartDateTimestamp).toLocaleDateString(),
//         time: new Date(booking.bookingStartDateTimestamp).toLocaleTimeString(),
//       }));
//       setUpcomingEvents(upcomingEventsFormatted);
//     };
  
//     return (
//       <>
//         <div className="dashboard-page__container">
//           <div className="wrapper">
//             <div className="analytics-container">
//               {userType === "ADMIN" && (
//                 <div className="analytics-item">
//                   <h2>Total Users</h2>
//                   <p>{analyticsData && analyticsData.totalUsers}</p>
//                 </div>
//               )}
//               <div className="analytics-item">
//                 <h2>Total Bookings</h2>
//                 <p>{analyticsData && analyticsData.totalBookings}</p>
//               </div>
//               <div className="analytics-item">
//                 <h2>Confirmed Bookings</h2>
//                 <p>{analyticsData && analyticsData.confirmedBookings}</p>
//               </div>
//             </div>
  
//             <div className="charts">
//               {userType === "ADMIN" && (
//                 <div className="chart-card">
//                   <h2>User Visits</h2>
//                   <canvas
//                     id="usr-visit"
//                     ref={chartRef}
//                     aria-label="chart"
//                     width="400"
//                     height="300"
//                   ></canvas>
//                 </div>
//               )}
//               <div className="chart-card">
//                 <h2>Booking Trends</h2>
//                 <canvas
//                   id="booking-chart"
//                   ref={bookingChartRef}
//                   aria-label="Booking Chart"
//                   width="400"
//                   height="300"
//                 ></canvas>
//               </div>
//               {userType === "ADMIN" && (
//                 <div className="chart-card">
//                   <h2>Analytics Curve</h2>
//                   <canvas
//                     id="analytics-curve"
//                     ref={analyticsCurveRef}
//                     aria-label="Analytics Curve"
//                     width="600"
//                     height="400"
//                   ></canvas>
//                 </div>
//               )}
//               {userType === "ADMIN" && (
//                 <div className="chart-card">
//                   <div className="analytics-container">
//                     <div className="analytics-item">
//                       <h2>Total Halls</h2>
//                       <p>{analyticsData && analyticsData.totalHalls}</p>
//                     </div>
//                     <div className="analytics-item">
//                       <h2>Total Vendors</h2>
//                       <p>{analyticsData && analyticsData.totalVendors}</p>
//                     </div>
//                   </div>
  
//                   <div className="city-location ">
//                     <h2>Top Booking Locations</h2>
//                     {renderTopLocationsCards()}
//                   </div>
//                 </div>
//               )}
//               {userType === "VENDOR" && (
//                 <div className="chart-card">
//                   <div className="upcoming-events">
//                     <h2>Upcoming Events</h2>
//                     <div className="event-list">
//                       {upcomingEvents.map((event) => (
//                         <div className="event-item" key={event.id}>
//                           <h3>{event.title}</h3>
//                           <p>
//                             <strong>Date:</strong> {event.date} &nbsp;
//                             <strong> Time:</strong> {event.time}
//                             <FaClock className="clock-icon" />
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </>
//     );
// }

// export default DashboardContainer