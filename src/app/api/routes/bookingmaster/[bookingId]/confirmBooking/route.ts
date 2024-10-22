import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { bookingMaster, hallBookingMaster } from "@/app/api/schemas";
import { ObjectId } from "mongodb";
import axios from "axios";

// Helper function to check if a string is a valid ObjectId
function isObjectIdFormat(str: string) {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  await connectDB(); // check database connection

  try {
    const captchaToken = req.headers.get("X-Captcha-Token");
    const bookingId = params.bookingId;
    const updatedFields: any = await req.json();

    if (!captchaToken) {
      return new Response(
        JSON.stringify({ message: "Missing captcha token!" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
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

    const { bookingStatus, customerEmail, hallMainEmail, documentId, ...data } =
      updatedFields;

    // Update the bookingStatus to 'confirmed' or 'REJECTED' in the bookingMaster table
    const updatedBooking = await bookingMaster.findOneAndUpdate(
      { _id: bookingId },
      { $set: { ...data, bookingStatus } },
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

    const {
      bookingType,
      createdAt,
      updatedAt,
      customerInfo,
      guestsCount,
      parkingRequirement,
      roomsCount,
      vehiclesCount,
      _v,
      ...info
    } = updatedBooking._doc;

    const newDocument = new hallBookingMaster({
      ...info,
      finalGuestCount: guestsCount,
      finalHallParkingRequirement: parkingRequirement,
      bookingStatus: "CONFIRMED",
      finalRoomCount: roomsCount,
      finalVehicleCount: vehiclesCount,
      bookingStatusRemark: "",
    });
    const savedDocument = await newDocument.save();

    if (!savedDocument) {
      return new Response(
        JSON.stringify({ message: "Sorry! operation failed." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(savedDocument), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
