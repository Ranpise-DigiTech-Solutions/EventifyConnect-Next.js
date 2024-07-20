import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import mongoose from "mongoose";
import { hallBookingMaster } from "@/app/api/schemas";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hallId = searchParams.get("hallId") || null;
  const startDate = searchParams.get("startDate") || null;
  const endDate = searchParams.get("endDate") || null;
  const captchaToken = req.headers.get("X-Captcha-Token");

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

  if (!hallId || !startDate || !endDate) {
    return new Response(
      JSON.stringify({ message: "All required parameters are missing!!" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const hallObjectId = new mongoose.Types.ObjectId(hallId);
  const startDateOfWeek = new Date(startDate);
  const endDateOfWeek = new Date(endDate);

  if (
    !mongoose.Types.ObjectId.isValid(hallObjectId) ||
    !startDateOfWeek ||
    !endDateOfWeek
  ) {
    return new Response(JSON.stringify({ message: "Invalid Credentials!" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Subtract 5 hours and 30 minutes (5*60 + 30 = 330 minutes)
  const startDateUTC = new Date(
    startDateOfWeek.getTime() + startDateOfWeek.getTimezoneOffset() * 60000
  ).toISOString();
  const endDateUTC = new Date(
    endDateOfWeek.getTime() + endDateOfWeek.getTimezoneOffset() * 60000
  ).toISOString();

  try {
    await connectDB(); // check database connection

    const hallBookings = await hallBookingMaster.aggregate([
      {
        $match: {
          hallId: hallObjectId,
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

    if (!hallBookings || hallBookings.length === 0) {
      return new Response(
        JSON.stringify({
          message:
            "No available slots found for this hall on the specified date range!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(hallBookings), {
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
