import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { hallBookingMaster } from "@/app/api/schemas";
import axios from "axios";

// Helper function to check if a string is a valid ObjectId
function isObjectIdFormat(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const captchaToken = req.headers.get("X-Captcha-Token");
  const bookingId = params.bookingId;
  const { searchParams } = new URL(req.url);
  const userType = searchParams.get("userType") || null;

  if (!captchaToken) {
    return new Response(JSON.stringify({ message: "Missing captcha token!" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // check weather the user is valid
  const reCaptchaResponse = await axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/reCaptchaValidation/v3/`,
    data: {
      token: captchaToken,
    },
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
  });

  if (reCaptchaResponse.data.success === false) {
    return new Response(
      JSON.stringify({ message: "Invalid reCAPTCHA response" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!userType || !bookingId) {
    return new Response(
      JSON.stringify({ message: "All required parameters are missing!!" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Validate customerId
  if (!isObjectIdFormat(bookingId)) {
    return new Response(
      JSON.stringify({
        message:
          "The server was unable to process the request due to invalid booking Id!!",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const bookingObjectId = new ObjectId(bookingId);

  try {
    await connectDB(); // check database connection

    const bookingData = await hallBookingMaster.aggregate([
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
          guestsCount: "$finalGuestCount",
          roomsCount: "$finalRoomCount",
          parkingRequirement: {
            label: {
              $cond: {
                if: "$finalHallParkingRequirement",
                then: "Yes",
                else: "No",
              },
            },
            value: "$finalHallParkingRequirement",
          },
          vehiclesCount: "$finalVehicleCount",
          customerVegRate: "$finalVegRate",
          customerNonVegRate: "$finalNonVegRate",
          customerVegItemsList: "$finalVegItemsList",
          customerNonVegItemsList: "$finalNonVegItemsList",
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
                  customerProfileImage: "$customerMaster.customerProfileImage",
                  customerAlternateMobileNo:
                    "$customerMaster.customerAlternateMobileNo",
                  customerAlternateEmail:
                    "$customerMaster.customerAlternateEmail",
                }
              : null,
        },
      },
    ]);

    if (!bookingData || bookingData.length === 0) {
      return new Response(
        JSON.stringify({
          message: "Couldn't fetch details. Something went wrong!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
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
