import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import mongoose from "mongoose";
import { hallBookingMaster } from "@/app/api/schemas";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hallId = searchParams.get("hallId") || null;
  const startDate = searchParams.get("startDate") || null;
  const endDate = searchParams.get("endDate") || null;
  //const captchaToken = req.headers.get("X-Captcha-Token");

  // if (!captchaToken) {
  //   return NextResponse.json({ message: "Missing captcha token!" }, {
  //     status: 401,
  //   });
  // }

  // check whether the user is valid
  // const reCaptchaResponse = await axios({
  //   method: "POST",
  //   url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/reCaptchaValidation/v3/`,
  //   // The fix: Removed the extra set of curly braces around the data object.
  //   data: {
  //     token: captchaToken,
  //   },
  //   headers: {
  //     Accept: "application/json, text/plain, */*",
  //     "Content-Type": "application/json",
  //   },
  // });

  // if (reCaptchaResponse.data.success === false) {
  //   return NextResponse.json(
  //     { message: "Invalid reCAPTCHA response" },
  //     {
  //       status: 400,
  //     }
  //   );
  // }

  if (!hallId || !startDate || !endDate) {
    return NextResponse.json(
      { message: "All required parameters are missing!!" },
      {
        status: 400,
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
    return NextResponse.json({ message: "Invalid Credentials!" }, {
      status: 400,
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
      return NextResponse.json(
        {
          message:
            "No available slots found for this hall on the specified date range!",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(hallBookings, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}
