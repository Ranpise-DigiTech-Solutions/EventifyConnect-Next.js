import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { bookingMaster } from "@/app/api/schemas";
import { ObjectId } from "mongodb";
import axios from "axios";

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
    // const captchaToken = req.headers.get("X-Captcha-Token");
    const bookingId = params.bookingId;
    const { searchParams } = new URL(req.url);
    const userType = searchParams.get("userType");

    // if (!captchaToken) {
    //   return new Response(
    //     JSON.stringify({ message: "Missing captcha token!" }),
    //     {
    //       status: 401,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

    // check weather the user is valid
    // const reCaptchaResponse = await axios({
    //   method: "POST",
    //   url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/reCaptchaValidation/v3/`,
    //   data: {
    //     token: captchaToken,
    //   },
    //   headers: {
    //     Accept: "application/json, text/plain, */*",
    //     "Content-Type": "application/json",
    //   },
    // });

    // if (reCaptchaResponse.data.success === false) {
    //   return new Response(
    //     JSON.stringify({ message: "Invalid reCAPTCHA response" }),
    //     {
    //       status: 400,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

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
            otherVendorRequirement: {
              label: { $cond: { if: "$otherVendorRequirement", then: "Yes", else: "No" } },
              value: "$otherVendorRequirement",
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
            // fields from vendorType collection
            vendorType: "$vendorType.vendorType",
            //fields from eventType collection
            eventTypeInfo: {
              value: "$eventType._id",
              label: "$eventType.eventName",
            },
            //fields from hallMaster collection
            requiredOtherVendors: 1,
            inHouseVendors: 1,
            outsidePartyVendors: 1,
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
    // const captchaToken = req.headers.get("X-Captcha-Token");
    const bookingId = params.bookingId;
    const {
      bookingStatus,
      remarks,
    }: { bookingStatus: string; remarks: string } = await req.json();

    // if (!captchaToken) {
    //   return new Response(
    //     JSON.stringify({ message: "Missing captcha token!" }),
    //     {
    //       status: 401,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

    // check weather the user is valid
    // const reCaptchaResponse = await axios({
    //   method: "POST",
    //   url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/reCaptchaValidation/v3/`,
    //   data: {
    //     token: captchaToken,
    //   },
    //   headers: {
    //     Accept: "application/json, text/plain, */*",
    //     "Content-Type": "application/json",
    //   },
    // });

    // if (reCaptchaResponse.data.success === false) {
    //   return new Response(
    //     JSON.stringify({ message: "Invalid reCAPTCHA response" }),
    //     {
    //       status: 400,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

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
    // const captchaToken = req.headers.get("X-Captcha-Token");
    const bookingId = params.bookingId;
    const updatedFields: any = await req.json();

    // if (!captchaToken) {
    //   return new Response(
    //     JSON.stringify({ message: "Missing captcha token!" }),
    //     {
    //       status: 401,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

    // check weather the user is valid
    // const reCaptchaResponse = await axios({
    //   method: "POST",
    //   url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/reCaptchaValidation/v3/`,
    //   data: {
    //     token: captchaToken,
    //   },
    //   headers: {
    //     Accept: "application/json, text/plain, */*",
    //     "Content-Type": "application/json",
    //   },
    // });

    // if (reCaptchaResponse.data.success === false) {
    //   return new Response(
    //     JSON.stringify({ message: "Invalid reCAPTCHA response" }),
    //     {
    //       status: 400,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

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

    const {bookingStatus, customerEmail, hallMainEmail, documentId, ...info} = updatedFields; 

    // send emails
    // if(bookingStatus === "CONFIRMED") {
    //   const response = await axios.post(
    //     `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/emailService/`,
    //     {
    //       senderType: "INFO_EC",
    //       recipientEmailId: customerEmail,
    //       bcc: hallMainEmail,
    //       subject: "EventifyConnect - OTP Verification",
    //       message: `<p>Dear User,</p>

    //         <p>Thank you for your order with EventifyConnect! We are pleased to confirm that your order has been received and is being processed.</p>

    //         <p><strong>Order Number:</strong> ${documentId}</p>
          
    //         <p>Please review your order details in our website. If you have any questions or need to make changes to your order, please contact us at support@eventifyconnect.com.</p>

    //         <p>Thank you for choosing EventifyConnect. We look forward to serving you!</p>

    //         <p>Best regards,<br/>
    //         EventifyConnect Team</p>

    //       `,
    //     }
    //   );
    // } else if(bookingStatus === "CANCELLED") {
    //   const response = await axios.post(
    //     `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/emailService/`,
    //     {
    //       senderType: "INFO_EC",
    //       recipientEmailId: customerEmail,
    //       bcc: hallMainEmail,
    //       subject: "EventifyConnect - Booking Information",
    //       message: `
    //           <p>Dear User,</p>

    //         <p>We regret to inform you that your order with EventifyConnect has been cancelled.</p>

    //         <p><strong>Order Number:</strong> ${documentId}</p>

    //         <p>We understand that circumstances may change, and we're here to assist you. If you have any questions or need further assistance regarding this cancellation, please do not hesitate to contact us at support@eventifyconnect.com.</p>

    //         <p>Thank you for your understanding. We hope to have the opportunity to serve you in the future.</p>

    //         <p>Best regards,<br/>
    //         EventifyConnect Team</p>
    //       `,
    //     }
    //   );
    // }
    
    // Update the bookingStatus to 'confirmed' or 'REJECTED' in the bookingMaster table
    const updatedBooking = await bookingMaster.findOneAndUpdate(
      { _id: bookingId },
      { $set: { ...info, bookingStatus } },
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
