import { default as express } from 'express';
const router = express.Router();
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { bookingMaster, hallBookingMaster } from '../models/index.js';
import { firestore } from "../database/FirebaseDb.js";

router.get("/", async (req, res) => {
    try {
        // Add logic here to fetch data from the database
        const data = await bookingMaster.find(); // Example: fetching all bookingMaster documents

        // Send the fetched data in the response
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// get the total hall owner count
router.get("/getBookingCount", async (req, res) => {

    const filter = {};

    try {
        const bookingCount = await bookingMaster.countDocuments(filter);

        if (typeof bookingCount !== "number") {
            return res.status(501).json({ message: "Connection to server failed." });
        }

        return res.status(200).json(bookingCount);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get("/fetchBookingById/:id", async (req, res) => {
    const bookingId = req.params.id;

    try {
        const bookingdata = await bookingMaster.findById(bookingId);

        if (!bookingdata) {
            return res.status(404).json({ message: "Booking not found" });
        }

        return res.status(200).json(bookingdata);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// fetch all the bookings of a particular customer
router.get("/getUserBookings", async (req, res) => {

    const { customerId, startDateOfMonth, endDateOfMonth, sortCriteria, bookingCategory } = req.query;

    // Helper function to check if a string is a valid ObjectId
    function isObjectIdFormat(str) {
        return /^[0-9a-fA-F]{24}$/.test(str);
    }

    // Validate customerId
    if (!customerId || !isObjectIdFormat(customerId)) {
        return res.status(422).json({ message: 'The server was unable to process the request due to invalid Customer Id.' });
    }

    const customerObjectId = new ObjectId(customerId);

    // Validate dates
    if (!startDateOfMonth || !endDateOfMonth) {
        return res.status(422).json({ message: 'Start date and end date of the month are required.' });
    }

    const page = parseInt(req.query.page) || 0; // default page no
    const limit = parseInt(req.query.limit) || 10; // default no of rows per page
    const skip = page * limit;

    const startDateOfMonthObj = new Date(startDateOfMonth);
    const endDateOfMonthObj = new Date(endDateOfMonth);

    const startDateUTC = new Date(startDateOfMonthObj.getTime() + (startDateOfMonthObj.getTimezoneOffset() * 60000)).toISOString();
    const endDateUTC = new Date(endDateOfMonthObj.getTime() + (endDateOfMonthObj.getTimezoneOffset() * 60000)).toISOString();

    try {

        const bookings = await bookingMaster.aggregate([
            {
                $match: {
                    customerId: customerObjectId,
                    bookingStatus: bookingCategory === "PENDING" ? bookingCategory : { $exists: true },
                    bookingStartDateTimestamp: bookingCategory === "UPCOMING" ? { $gt: new Date() } : { $exists: true },
                    bookingEndDateTimestamp: bookingCategory === "COMPLETED" ? { $lt: new Date() } : { $exists: true },
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
                    ]
                }
            },
            {
                $lookup: {
                    from: 'hallmasters',
                    localField: 'hallId',
                    foreignField: '_id',
                    as: 'hallMaster'
                }
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
                $unwind: '$hallMaster'
            },
            {
                $unwind: '$eventType'
            },
            {
                $unwind: '$vendorType'
            },
            {
                $addFields: {
                    sortKey: {
                        $switch: {
                            branches: [
                                { case: { $eq: [sortCriteria, "bookingId"] }, then: "$_id" },
                                { case: { $eq: [sortCriteria, "hallName"] }, then: "$hallMaster.hallName" },
                                { case: { $eq: [sortCriteria, "eventType"] }, then: "$eventType.eventName" },
                                { case: { $eq: [sortCriteria, "vendorType"] }, then: "$vendorType.vendorType" },
                                { case: { $eq: [sortCriteria, "bookingStartDate"] }, then: "$bookingStartDateTimestamp" },
                                { case: { $eq: [sortCriteria, "bookingDuration"] }, then: "$bookingDuration" },
                                { case: { $eq: [sortCriteria, "bookingStatus"] }, then: "$bookingStatus" }
                            ],
                            default: null // Optional: default value if none of the conditions match
                        }
                    }
                }
            },
            ...(sortCriteria !== "" ? sortCriteria === "bookingStartDate" ? [{ $sort: { sortKey: -1 } }] : [{ $sort: { sortKey: 1 } }] : []), // Apply sort if shouldSort is true
            {
                $facet: {
                    bookings: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                documentId: 1,
                                bookingStartDateTimestamp: 1,
                                // freezDays: "$hallMaster.hallFreezDays",
                                bookingDuration: 1,
                                bookingStatus: 1,
                                vendorType: '$vendorType.vendorType',
                                hallName: '$hallMaster.hallName',
                                eventName: '$eventType.eventName',
                            }
                        }
                    ],
                    total: [
                        { $count: 'count' }
                    ]
                }
            },
        ]);


        // if (bookings.total[0].count === 0) {
        //     return res.status(404).json({ message: "No bookings found!" });
        // }

        return res.status(200).json(bookings);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }

});

// fetch all the bookings of a particular hall vendor
router.get("/getHallBookings", async (req, res) => {

    const { hallId, startDateOfMonth, endDateOfMonth, sortCriteria, bookingCategory } = req.query;

    // Helper function to check if a string is a valid ObjectId
    function isObjectIdFormat(str) {
        return /^[0-9a-fA-F]{24}$/.test(str);
    }

    // Validate serviceProviderId
    if (!hallId || !isObjectIdFormat(hallId)) {
        return res.status(422).json({ message: 'The server was unable to process the request due to invalid Hall Id.' });
    }

    const hallObjectId = new ObjectId(hallId);

    // Validate dates
    if (!startDateOfMonth || !endDateOfMonth) {
        return res.status(422).json({ message: 'Start date and end date of the month are required.' });
    }

    const page = parseInt(req.query.page) || 0; // default page no
    const limit = parseInt(req.query.limit) || 10; // default no of rows per page
    const skip = page * limit;

    const startDateOfMonthObj = new Date(startDateOfMonth);
    const endDateOfMonthObj = new Date(endDateOfMonth);

    const startDateUTC = new Date(startDateOfMonthObj.getTime() + (startDateOfMonthObj.getTimezoneOffset() * 60000)).toISOString();
    const endDateUTC = new Date(endDateOfMonthObj.getTime() + (endDateOfMonthObj.getTimezoneOffset() * 60000)).toISOString();

    try {
        const bookings = await bookingMaster.aggregate([
            // Pipeline for bookingMaster
            {
                $lookup: {
                    from: 'customermasters',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customerMaster'
                }
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
                $unwind: {
                    path: '$customerMaster',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$eventType',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    customerName: '$customerMaster.customerName',
                    eventName: '$eventType.eventName',
                    bookingId: '$_id'
                }
            },
            {
                $match: {
                    hallId: hallObjectId,
                    bookingStatus: bookingCategory === "PENDING" ? bookingCategory : { $exists: true },
                    bookingStartDateTimestamp: bookingCategory === "UPCOMING" ? { $gt: new Date() } : { $exists: true },
                    bookingEndDateTimestamp: bookingCategory === "COMPLETED" ? { $lt: new Date() } : { $exists: true },
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
                                { bookingEndDateTimestamp: null }
                            ]
                        }
                    ]
                }
            },
            {
                $unionWith: {
                    coll: 'hallbookingmasters',
                    pipeline: [
                        {
                            $match: {
                                hallId: hallObjectId,
                                bookingStatus: bookingCategory === "PENDING" ? bookingCategory : { $exists: true },
                                bookingStartDateTimestamp: bookingCategory === "UPCOMING" ? { $gt: new Date() } : { $exists: true },
                                bookingEndDateTimestamp: bookingCategory === "COMPLETED" ? { $lt: new Date() } : { $exists: true },
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
                                            { bookingEndDateTimestamp: null }
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            $lookup: {
                                from: 'customermasters',
                                localField: 'customerId',
                                foreignField: '_id',
                                as: 'customerMaster'
                            }
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
                            $unwind: {
                                path: '$customerMaster',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $unwind: {
                                path: '$eventType',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $addFields: {
                                customerName: "$customerName" === null ? "$customerMaster.customerName" : "$customerName",
                                eventName: '$eventType.eventName'
                            }
                        },
                        {
                            $addFields: {
                                bookingId: '$_id'
                            }
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: '$bookingId',
                    document: { $first: '$$ROOT' }
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$document'
                }
            },
            {
                $addFields: {
                    sortKey: {
                        $switch: {
                            branches: [
                                { case: { $eq: [sortCriteria, "bookingId"] }, then: "$_id" },
                                { case: { $eq: [sortCriteria, "customerName"] }, then: "$customerName" },
                                { case: { $eq: [sortCriteria, "eventType"] }, then: "$eventName" },
                                { case: { $eq: [sortCriteria, "customerType"] }, then: "$customerType" },
                                { case: { $eq: [sortCriteria, "bookingStartDate"] }, then: "$bookingStartDateTimestamp" },
                                { case: { $eq: [sortCriteria, "bookingDuration"] }, then: "$bookingDuration" },
                                { case: { $eq: [sortCriteria, "bookingStatus"] }, then: "$bookingStatus" }
                            ],
                            default: null
                        }
                    }
                }
            },
            ...(sortCriteria !== "" ? (sortCriteria === "bookingStartDate" ? [{ $sort: { sortKey: -1 } }] : [{ $sort: { sortKey: 1 } }]) : []),
            {
                $facet: {
                    bookings: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                documentId: 1,
                                bookingStartDateTimestamp: 1,
                                bookingDuration: 1,
                                bookingStatus: 1,
                                customerName: 1,
                                customerType: 1,
                                eventName: 1,
                            }
                        }
                    ],
                    total: [
                        { $count: 'count' }
                    ]
                }
            },
            {
                $project: {
                    bookings: 1,
                    total: 1
                }
            }
        ]);
        
        
        return res.status(200).json(bookings);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }

});

//fetch a specific booking detail by bookingId
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

        const bookingData = await bookingMaster.aggregate([
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
                    guestsCount: 1,
                    roomsCount: 1,
                    parkingRequirement: {
                        label: { $cond: { if: "$parkingRequirement", then: "Yes", else: "No" } },
                        value: '$parkingRequirement'
                    },
                    vehiclesCount: 1,
                    customerVegRate: 1,
                    customerNonVegRate: 1,
                    customerVegItemsList: 1,
                    customerNonVegItemsList: 1,
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
                    } : { _id: "$hallMaster._id", },
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

router.put('/:id', async (req, res) => {

    try {
        const { id } = req.params;
        const { bookingStatus, remarks } = req.body;
        // Update the bookingStatus to 'confirmed' or 'REJECTED' in the bookingMaster table
        const updatedBooking = await bookingMaster.findByIdAndUpdate(
            id,
            { bookingStatus, remarks },
            { new: true }
        );

        res.status(200).json(updatedBooking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// route only created for hall bookings
router.post("/", async (req, res) => {
    const postData = req.body;
    console.log(postData);
    if (!postData) {
        return res.status(404).json({ message: "Request Body attachment not found!!" });
    }

    const hallObjectId = new mongoose.Types.ObjectId(postData.hallId);
    const vendorTypeObjectId = new mongoose.Types.ObjectId(postData.vendorTypeId);
    const eventTypeObjectId = new mongoose.Types.ObjectId(postData.eventId);
    const customerObjectId = new mongoose.Types.ObjectId(postData.customerId);
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

    console.log("New Booking Id: " + newId);

    const updatedData = {
        documentId: parseInt(newId),
        ...postData,
        hallId: hallObjectId,
        vendorTypeId: vendorTypeObjectId,
        eventId: eventTypeObjectId,
        customerId: customerObjectId,
        hallUserId: hallUserObjectId
    };

    const newDocument = new bookingMaster(updatedData);
    console.log("ENTERED 1")
    console.log(hallUserObjectId);

    if (!newDocument) {
        return res.status(404).json({ message: "Operation Failed!!" });
    }
    console.log("ENTERED 2")

    try {
        const savedDocument = await newDocument.save();

        console.log("ENTERED 2")
        // Update the Firestore document with the new ID
        await updateDoc(docRef, { currentId: newId });

        return res.status(200).json(savedDocument);
    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
});

router.patch("/updateBookingDetails/:id", async (req, res) => {
    const resourceId = req.params.id;
    const updatedFields = req.body;

    if (!resourceId || !updatedFields) {
        return res.status(404).json({ message: "Required fields not found!!" });
    }

    try {

        const updatedResource = await bookingMaster.findOneAndUpdate(
            { _id: resourceId },
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedResource) {
            return res.status(404).json({ message: "Resource not found!!" });
        }

        return res.status(200).json(updatedResource);

    } catch (error) {
        return res.status(500).json({ message: "Operation Failed!!" });
    }
})

export default router;