import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { ObjectId, Document } from "mongodb";
import { photographerMaster } from "@/app/api/schemas";
import axios from "axios";

// Function to determine sort criteria
function getSortCriteria(filter: string): any {
  switch (filter) {
    case "Oldest":
      return { createdTime: 1 as 1 }; // Ascending order for oldest first
    case "Most Liked":
      return { vendorLikesCount: -1 as -1 }; // Descending order for most liked first
    case "Most Popular":
      return { vendorMaxBookings: -1 as -1 }; // Descending order for most popular first
    case "Top Rated":
      return { vendorUserRating: -1 as -1 }; // Descending order for top rated first
    default:
      return null; // Default sort criteria (no sorting)
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const selectedCity = searchParams.get("selectedCity") || "";
  const eventId = searchParams.get("eventId") || "";
  const filter = searchParams.get("filter") || "";
  const captchaToken = req.headers.get("X-Captcha-Token");

  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "0");
  const skip = page * limit;

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

  if (!selectedCity || !filter) {
    return new Response(
      JSON.stringify({ message: "All required parameters are missing!!" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let eventObjectId = null; // Event Type Object ID in Str

  function isObjectIdFormat(str: string) {
    return /^[0-9a-fA-F]{24}$/.test(str);
  }

  if (eventId && isObjectIdFormat(eventId)) {
    eventObjectId = new ObjectId(eventId);
    if (!ObjectId.isValid(eventObjectId)) {
      eventObjectId = null;
    }
  }

  const sortCriteria = getSortCriteria(filter);

  try {
    await connectDB(); // check database connection

    const dataPipeline: Array<any> = [
      {
        $match: {
          companyCity: selectedCity ? selectedCity : { $exists: true },
          vendorEventTypes: eventObjectId
            ? { $in: [eventObjectId] }
            : { $exists: true },
        },
      },
      {
        $facet: {
          photographersData: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                companyName: 1,
                companyTaluk: 1,
                companyCity: 1,
                companyState: 1,
                vendorImages: 1,
                vendorDescription: 1,
                hallUserRating: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    if (sortCriteria) {
      dataPipeline.push({ $sort: sortCriteria });
    }

    const data =  await photographerMaster.aggregate(dataPipeline);

    return new Response(
      JSON.stringify({
        data: data[0]?.photographersData,
        totalCount: data[0]?.total[0]?.count,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
