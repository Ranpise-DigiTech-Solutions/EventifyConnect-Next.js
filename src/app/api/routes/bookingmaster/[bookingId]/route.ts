import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { bookingMaster } from "@/app/api/schemas";
import { ObjectId } from "mongodb";

// Helper function to check if a string is a valid ObjectId
function isObjectIdFormat(str: string) {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  await connectDB(); // check database connection
  try {
    const bookingId = params.bookingId;
    const { searchParams } = new URL(req.url);
    const userType = searchParams.get("userType");

    // Validate customerId
    if (!bookingId || !isObjectIdFormat(bookingId)) {
      return new Response(
        JSON.stringify({
          message:
            "The server was unable to process the request due to invalid Booing Id!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const bookingObjectId = new ObjectId(bookingId);
    let bookingData;

    if (!userType) {
      bookingData = await bookingMaster.findById(bookingId);
    } else {
      bookingData = await bookingMaster.aggregate([
        {
          $match: {
            _id: bookingObjectId,
          },
        },
        {
          $lookup: {
            from: "hallmasters",
            localField: "hallId",
            foreignField: "_id",
            as: "hallMaster",
          },
        },
        {
          $lookup: {
            from: "customermasters",
            localField: "customerId",
            foreignField: "_id",
            as: "customerMaster",
          },
        },
        {
          $lookup: {
            from: "eventtypes",
            localField: "eventId",
            foreignField: "_id",
            as: "eventType",
          },
        },
        {
          $lookup: {
            from: "vendortypes",
            localField: "vendorTypeId",
            foreignField: "_id",
            as: "vendorType",
          },
        },
        {
          $unwind: "$hallMaster",
        },
        {
          $unwind: "$customerMaster",
        },
        {
          $unwind: "$eventType",
        },
        {
          $unwind: "$vendorType",
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
              value: "$bookCaterer",
            },
            guestsCount: 1,
            roomsCount: 1,
            parkingRequirement: {
              label: {
                $cond: { if: "$parkingRequirement", then: "Yes", else: "No" },
              },
              value: "$parkingRequirement",
            },
            vehiclesCount: 1,
            customerVegRate: 1,
            customerNonVegRate: 1,
            customerVegItemsList: 1,
            customerNonVegItemsList: 1,
            // fields from vendorType collection
            vendorType: "$vendorType.vendorType",
            //fields from eventType collection
            eventTypeInfo: {
              value: "$eventType._id",
              label: "$eventType.eventName",
            },
            //fields from hallMaster collection
            hallData:
              userType === "CUSTOMER"
                ? {
                    _id: "$hallMaster._id",
                    hallName: "$hallMaster.hallName",
                    hallLocation: {
                      $concat: [
                        "$hallMaster.hallCity",
                        ", ",
                        "$hallMaster.hallState",
                        ", ",
                        "$hallMaster.hallCountry",
                      ],
                    },
                    hallLandmark: "$hallMaster.hallLandmark",
                    hallCapacity: "$hallMaster.hallCapacity",
                    hallRooms: "$hallMaster.hallRooms",
                    hallVegRate: "$hallMaster.hallVegRate",
                    hallNonVegRate: "$hallMaster.hallNonVegRate",
                    hallParking: {
                      $cond: {
                        if: "$hallMaster.hallParking",
                        then: "Available",
                        else: "UnAvailable",
                      },
                    },
                    hallImage: { $arrayElemAt: ["$hallMaster.hallImages", 0] },
                  }
                : { _id: "$hallMaster._id" },
            customerData:
              userType === "VENDOR"
                ? {
                    _id: "$customerMaster._id",
                    customerName: "$customerMaster.customerName",
                    customerAddress: {
                      $concat: [
                        "$customerMaster.customerAddress",
                        ", ",
                        "$customerMaster.customerCity",
                        ", ",
                        "$customerMaster.customerState",
                        ", ",
                        "$customerMaster.customerCountry",
                      ],
                    },
                    customerLandmark: "$customerMaster.customerLandmark",
                    customerEmail: "$customerMaster.customerEmail",
                    customerContact: "$customerMaster.customerContact",
                    customerProfileImage:
                      "$customerMaster.customerProfileImage",
                    customerAlternateMobileNo:
                      "$customerMaster.customerAlternateMobileNo",
                    customerAlternateEmail:
                      "$customerMaster.customerAlternateEmail",
                  }
                : null,
          },
        },
      ]);
    }

    if (!bookingData) {
      return new Response(JSON.stringify({ message: "No data found!" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(bookingData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  await connectDB(); // check database connection
  try {
    const bookingId = params.bookingId;
    const {
      bookingStatus,
      remarks,
    }: { bookingStatus: string; remarks: string } = await req.json();

    // Validate bookingId
    if (!bookingId || !isObjectIdFormat(bookingId)) {
      return new Response(
        JSON.stringify({
          message:
            "The server was unable to process the request due to invalid Booing Id!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!bookingStatus || !remarks) {
      return new Response(
        JSON.stringify({
          message: "Missing required fields: bookingStatus, remarks",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update the bookingStatus to 'confirmed' or 'REJECTED' in the bookingMaster table
    const updatedBooking = await bookingMaster.findByIdAndUpdate(
      bookingId,
      { bookingStatus, remarks },
      { new: true }
    );

    if (!updatedBooking) {
      return new Response(
        JSON.stringify({
          message: "Sorry! coudn't update booking found with given ID!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(updatedBooking), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  await connectDB(); // check database connection
  try {
    const bookingId = params.bookingId;
    const updatedFields: any = await req.json();

    if (!bookingId || !isObjectIdFormat(bookingId)) {
      return new Response(
        JSON.stringify({
          message:
            "The server was unable to process the request due to invalid bookingId!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!updatedFields) {
      return new Response(
        JSON.stringify({
          message: "Required body attachments not found!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update the bookingStatus to 'confirmed' or 'REJECTED' in the bookingMaster table
    const updatedBooking = await bookingMaster.findOneAndUpdate(
      { _id: bookingId },
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedBooking) {
      return new Response(
        JSON.stringify({
          message: "Sorry! coudn't update booking found with given ID!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(updatedBooking), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
