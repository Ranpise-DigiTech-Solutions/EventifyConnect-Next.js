import { default as express } from "express";
const router = express.Router();
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from "../database/FirebaseDb.js";

import { hallMaster, hallBookingMaster } from "../models/index.js";

router.get("/", async (req, res) => {
  try {
    // Add logic here to fetch data from the database
    const data = await hallBookingMaster.find(); // Example: fetching all bookingMaster documents

    // Send the fetched data in the response
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/getHallsAvailabilityStatus", async (req, res) => {
  const { selectedDate, selectedCity, eventId, filter } = req.query;

  let eventObjectId = ""; // Event Type Object ID in Str

  function isObjectIdFormat(str) {
    return /^[0-9a-fA-F]{24}$/.test(str);
  }

  if (eventId && isObjectIdFormat(eventId)) {
    eventObjectId = new ObjectId(eventId);
    if (!ObjectId.isValid(eventObjectId)) {
      eventObjectId = null;
    }
  } else {
    eventObjectId = null;
  }

  // Function to determine sort criteria
  function getSortCriteria(filter) {
    switch (filter) {
      case 'Oldest':
        return { createdTime: 1 };  // Ascending order for oldest first
      case 'Most Liked':
        return { hallLikesCount: -1 };  // Descending order for most liked first
      case 'Most Popular':
        return { hallMaxBookings: -1 };  // Descending order for most popular first
      case 'Top Rated':
        return { hallUserRating: -1 };  // Descending order for top rated first
      default:
        return null;  // Default sort criteria (no sorting)
    }
  }

  const sortCriteria = getSortCriteria(filter);

  try {
    // Get all halls
    const allHallsPipeline = [
      {
        $match: {
          hallCity: selectedCity ? selectedCity : { $exists: true },
          hallEventTypes: eventObjectId ? { $in: [eventObjectId] } : { $exists: true },
        },
      },
    ];

    if (sortCriteria) {
      allHallsPipeline.push({ $sort: sortCriteria });
    }

    const allHalls = await hallMaster.aggregate(allHallsPipeline);


    // Find bookings for the given date
    const startDate = new Date(selectedDate + "T00:00:00.000Z");
    const endDate = new Date(selectedDate + "T23:59:59.999Z");

    const startDateUTC = new Date(startDate.getTime() + (startDate.getTimezoneOffset() * 60000)).toISOString();
    const endDateUTC = new Date(endDate.getTime() + (endDate.getTimezoneOffset() * 60000)).toISOString();

    const bookings = await hallBookingMaster.aggregate([
      {
        $match: {
          $or: [
            {
              $and: [
                { bookingStartDateTimestamp: { $lte: new Date(endDateUTC) } },
                { bookingEndDateTimestamp: { $gte: new Date(startDateUTC) } },
              ],
            },
            {
              $and: [
                { bookingStartDateTimestamp: { $lte: new Date(endDateUTC) } },
                { bookingEndDateTimestamp: null }, // Handling bookings that extend beyond the selected date
              ],
            },
          ],
          hallCity: selectedCity ? selectedCity : { $exists: true },
          eventId: eventObjectId ? eventObjectId : { $exists: true },
        },
      },
      {
        $project: {
          hallId: 1,
          hallCity: 1,
          totalDuration: {
            $cond: [
              // 1. check if booking spans the entire day
              {
                $and: [
                  { $lte: ["$bookingStartDateTimestamp", new Date(startDateUTC)] },
                  { $gte: ["$bookingEndDateTimestamp", new Date(endDateUTC)] },
                ],
              },
              "$bookingDuration", // Use full duration if booking spans the entire selected date
              {
                $cond: [
                  // 2. check if booking starts on or after the selected date
                  { $gte: ["$bookingStartDateTimestamp", new Date(startDateUTC)] },
                  // if it does, calculate the duration from the start of selected date to the end of booking date
                  { $divide: [{ $subtract: [new Date(endDateUTC), "$bookingStartDateTimestamp"] }, 3600000] }, // Convert to hours
                  // if it doesn't, calculate the duration from booking start date to the end of the selected date
                  { $divide: [{ $subtract: ["$bookingEndDateTimestamp", new Date(startDateUTC)] }, 3600000] }, // Convert to hours
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            hallId: "$hallId",
            hallCity: "$hallCity",
          },
          totalDuration: { $sum: "$totalDuration" },
        },
      },
      {
        $project: {
          _id: 0,
          hallId: "$_id.hallId",
          hallCity: "$_id.hallCity",
          totalDuration: 1,
        },
      },
    ]);

    // Group bookings by hall
    const bookingsByHall = {};
    bookings.forEach((booking) => {
      bookingsByHall[booking.hallId] = booking;
    });


    // Calculate availability status for each hall
    const hallAvailability = allHalls.map((hall) => {
      const isHallAvailable = !bookingsByHall[hall._id]; //check if the hall is booked atleast once
      const checkAvailability = () => {
        const hallBookingDetails = bookingsByHall[hall._id];
        return hallBookingDetails.totalDuration > 18
          ? "UNAVAILABLE"
          : "LIMITED AVAILABILITY";
      };
      const availabilityStatus = isHallAvailable
        ? "AVAILABLE"
        : checkAvailability();
      return {
        hallId: hall._id,
        hallName: hall.hallName,
        availability: availabilityStatus,
        hallCity: hall.hallCity,
        hallImages: hall.hallImages,
        hallDescription: hall.hallDescription,
        hallVegRate: hall.hallVegRate,
        hallNonVegRate: hall.hallNonVegRate,
        hallCapacity: hall.hallCapacity,
        hallRooms: hall.hallRooms,
        hallParking: hall.hallParking,
        hallFreezDay: hall.hallFreezDay,
      };
    });

    return res.status(200).json(hallAvailability);
  } catch (error) {
    console.error("Error calculating available time slots:", error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/getHallAvailability", async (req, res) => {
  const { hallId, startDate, endDate } = req.query;
  const hallObjectId = new mongoose.Types.ObjectId(hallId);

  const startDateOfWeek = new Date(startDate);
  const endDateOfWeek = new Date(endDate);

  // Subtract 5 hours and 30 minutes (5*60 + 30 = 330 minutes)
  const startDateUTC = new Date(startDateOfWeek.getTime() + (startDateOfWeek.getTimezoneOffset() * 60000)).toISOString();
  const endDateUTC = new Date(endDateOfWeek.getTime() + (endDateOfWeek.getTimezoneOffset() * 60000)).toISOString();

  try {
    const hallBookings = await hallBookingMaster.aggregate([
      {
        $match: {
          hallId: hallObjectId,
          $or: [
            {
              $and: [
                { bookingStartDateTimestamp: { $lte: new Date(endDateUTC) } },
                { bookingEndDateTimestamp: { $gte: new Date(startDateUTC) } }
              ]
            },
            {
              $and: [
                { bookingStartDateTimestamp: { $lte: new Date(endDateUTC) } },
                { bookingEndDateTimestamp: null } // Handling bookings that extend beyond the selected date
              ]
            }
          ],
        },
      },
      {
        $project: {
          _id: 1,
          hallId: 1,
          bookingStartDateTimestamp: 1,
          bookingEndDateTimestamp: 1,
          bookingDuration: 1,
          customerType: 1,
        },
      },
    ]);

    if (!hallBookings) {
      return res.status(200).json({ message: "No data found!!" });
    }

    return res.status(200).json(hallBookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/getHallBookings", async (req, res) => {

  const { hallId, bookingStartDateTimestamp, bookingEndDateTimestamp } = req.query;  //date format - mongodb format
  const hallObjectId = new mongoose.Types.ObjectId(hallId);
  const startDate = new Date(bookingStartDateTimestamp);
  const endDate = new Date(bookingEndDateTimestamp);

  const startDateUTC = new Date(startDate.getTime() + (startDate.getTimezoneOffset() * 60000)).toISOString();
  const endDateUTC = new Date(endDate.getTime() + (endDate.getTimezoneOffset() * 60000)).toISOString();

  try {
    const hallBookings = await hallBookingMaster.aggregate([
      {
        $match: {
          hallId: hallObjectId,
          $or: [
            {
              $and: [
                { bookingStartDateTimestamp: { $lte: new Date(endDateUTC) } },
                { bookingEndDateTimestamp: { $gte: new Date(startDateUTC) } }
              ]
            },
            {
              $and: [
                { bookingStartDateTimestamp: { $lte: new Date(endDateUTC) } },
                { bookingEndDateTimestamp: null } // Handling bookings that extend beyond the selected date
              ]
            }
          ],
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          count: { $ifNull: ["$count", 0] }
        }
      }
    ]);
    if (hallBookings.length === 0) {
      return res.status(200).json({ count: 0 });
    }

    return res.status(200).json(hallBookings[0]);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// fetch a specific booking details by bookingId
router.get('/getBookingDetailsById', async (req, res) => {

  const { bookingId, userType } = req.query;

  if (!userType) {
    return res.status(404).json({ message: "UserType not specified!" })
  }

  // Helper function to check if a string is a valid ObjectId
  function isObjectIdFormat(str) {
    return /^[0-9a-fA-F]{24}$/.test(str);
  }

  // Validate customerId
  if (!bookingId || !isObjectIdFormat(bookingId)) {
    return res.status(422).json({ message: 'The server was unable to process the request due to invalid booking Id.' });
  }

  const bookingObjectId = new ObjectId(bookingId);

  try {

    const bookingData = await hallBookingMaster.aggregate([
      {
        $match: {
          _id: bookingObjectId,
        },
      },
      {
        $lookup: {
          from: 'hallmasters',
          localField: 'hallId',
          foreignField: '_id',
          as: 'hallMaster',
        },
      },
      {
        $lookup: {
          from: 'customermasters',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerMaster',
        },
      },
      {
        $lookup: {
          from: 'eventtypes',
          localField: 'eventId',
          foreignField: '_id',
          as: 'eventType'
        }
      },
      {
        $lookup: {
          from: 'vendortypes',
          localField: 'vendorTypeId',
          foreignField: '_id',
          as: 'vendorType'
        }
      },
      {
        $unwind: '$hallMaster',
      },
      {
        $unwind: '$customerMaster',
      },
      {
        $unwind: '$eventType'
      },
      {
        $unwind: '$vendorType'
      },
      // {
      //     $addFields: {
      //         hallMaster: '$hallMaster', // Preserve hallMaster as a nested object
      //     },
      // },
      {
        $project: {
          // fields from bookingMaster collection
          _id: 1,
          documentId: 1,
          bookingStartDateTimestamp: 1,
          bookingEndDateTimestamp: 1,
          bookingDuration: 1,
          bookingStatus: 1,
          catererRequirement: {
            label: { $cond: { if: "$bookCaterer", then: "Yes", else: "No" } },
            value: "$bookCaterer"
          },
          guestsCount: "$finalGuestCount",
          roomsCount: "$finalRoomCount",
          parkingRequirement: {
            label: { $cond: { if: "$finalHallParkingRequirement", then: "Yes", else: "No" } },
            value: '$finalHallParkingRequirement'
          },
          vehiclesCount: "$finalVehicleCount",
          customerVegRate: "$finalVegRate",
          customerNonVegRate: "$finalNonVegRate",
          customerVegItemsList: "$finalVegItemsList",
          customerNonVegItemsList: "$finalNonVegItemsList",
          // fields from vendorType collection
          vendorType: '$vendorType.vendorType',
          //fields from eventType collection
          eventTypeInfo: { value: '$eventType._id', label: '$eventType.eventName' },
          //fields from hallMaster collection
          hallData: userType === "CUSTOMER" ? {
            _id: "$hallMaster._id",
            hallName: "$hallMaster.hallName",
            hallLocation: {
              $concat: [
                '$hallMaster.hallCity',
                ', ',
                '$hallMaster.hallState',
                ', ',
                '$hallMaster.hallCountry'
              ]
            },
            hallLandmark: "$hallMaster.hallLandmark",
            hallCapacity: "$hallMaster.hallCapacity",
            hallRooms: "$hallMaster.hallRooms",
            hallVegRate: "$hallMaster.hallVegRate",
            hallNonVegRate: "$hallMaster.hallNonVegRate",
            hallParking: { $cond: { if: "$hallMaster.hallParking", then: "Available", else: "UnAvailable" } },
            hallImage: { $arrayElemAt: ["$hallMaster.hallImages", 0] },
          } : { _id: "$hallMaster._id" },
          customerData: userType === "VENDOR" ? {
            _id: "$customerMaster._id",
            customerName: "$customerMaster.customerName",
            customerAddress: {
              $concat: [
                '$customerMaster.customerAddress',
                ', ',
                '$customerMaster.customerCity',
                ', ',
                '$customerMaster.customerState',
                ', ',
                '$customerMaster.customerCountry'
              ]
            },
            customerLandmark: "$customerMaster.customerLandmark",
            customerEmail: "$customerMaster.customerEmail",
            customerContact: "$customerMaster.customerContact",
            customerProfileImage: "$customerMaster.customerProfileImage",
            customerAlternateMobileNo: "$customerMaster.customerAlternateMobileNo",
            customerAlternateEmail: "$customerMaster.customerAlternateEmail",
          } : null,
        },
      },
    ]);

    if (!bookingData) {
      return res.status(404).json({ message: "No booking found!" });
    }

    return res.status(200).json(bookingData);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

});

router.post("/", async (req, res) => {

  const newDocument = new hallBookingMaster(req.body);

  if (!newDocument) {
    return res
      .status(404)
      .json({ message: "Request Body attachment not found!!" });
  }

  try {
    const savedDocument = await newDocument.save();
    return res.status(200).json(savedDocument);
  } catch (err) {
    console.error("An error occurred:", err);
    return res.status(500).json(err);
  }
});

router.post("/bookWalkInCustomer", async (req, res) => {
  const postData = req.body;
  if (!postData) {
    return res.status(404).json({ message: "Request Body attachment not found!!" });
  }

  const hallObjectId = new mongoose.Types.ObjectId(postData.hallId);
  const vendorTypeObjectId = new mongoose.Types.ObjectId(postData.vendorTypeId);
  const eventTypeObjectId = new mongoose.Types.ObjectId(postData.eventId);
  const hallUserObjectId = new mongoose.Types.ObjectId(postData.hallUserId);

  // to get the updated booking id from firebase
  const docRef = doc(firestore, "counters", "bookingMasterId");
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return res.status(404).send("Document not found!");
  }

  const data = docSnap.data();
  const prevId = data.currentId;
  const newId = prevId + 1;

  const updatedData = {
    documentId: parseInt(newId),
    ...postData,
    hallId: hallObjectId,
    vendorTypeId: vendorTypeObjectId,
    eventId: eventTypeObjectId,
    hallUserId: hallUserObjectId
  };

  const newDocument = new hallBookingMaster(updatedData);
  if (!newDocument) {
    return res.status(404).json({ message: "Operation Failed!!" });
  }

  try {
    const savedDocument = await newDocument.save();

    // Update the Firestore document with the new ID
    await updateDoc(docRef, { currentId: newId });

    return res.status(200).json(savedDocument);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

export default router;
