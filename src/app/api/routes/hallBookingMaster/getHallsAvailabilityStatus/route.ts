import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { ObjectId, Document } from "mongodb";
import { hallBookingMaster, hallMaster } from "@/app/api/schemas";

// Function to determine sort criteria
function getSortCriteria(filter: string): any {
  switch (filter) {
    case "Oldest":
      return { createdTime: 1 as 1 }; // Ascending order for oldest first
    case "Most Liked":
      return { hallLikesCount: -1 as -1 }; // Descending order for most liked first
    case "Most Popular":
      return { hallMaxBookings: -1 as -1 }; // Descending order for most popular first
    case "Top Rated":
      return { hallUserRating: -1 as -1 }; // Descending order for top rated first
    default:
      return null; // Default sort criteria (no sorting)
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const selectedDate = searchParams.get("selectedDate") || "";
  const selectedCity = searchParams.get("selectedCity") || "";
  const eventId = searchParams.get("eventId") || "";
  const filter = searchParams.get("filter") || "";

  if (!selectedCity || !selectedDate || !filter) {
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

    const allHallsPipeline: Array<any> = [
      {
        $match: {
          hallCity: selectedCity ? selectedCity : { $exists: true },
          hallEventTypes: eventObjectId
            ? { $in: [eventObjectId] }
            : { $exists: true },
        },
      },
    ];

    if (sortCriteria) {
      allHallsPipeline.push({ $sort: sortCriteria });
    }

    const allHalls: Array<Object> = await hallMaster.aggregate(
      allHallsPipeline
    );

    // Find bookings for the given date
    const startDate = new Date(selectedDate + "T00:00:00.000Z");
    const endDate = new Date(selectedDate + "T23:59:59.999Z");

    const startDateUTC = new Date(
      startDate.getTime() + startDate.getTimezoneOffset() * 60000
    ).toISOString();
    const endDateUTC = new Date(
      endDate.getTime() + endDate.getTimezoneOffset() * 60000
    ).toISOString();

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
                  {
                    $lte: [
                      "$bookingStartDateTimestamp",
                      new Date(startDateUTC),
                    ],
                  },
                  { $gte: ["$bookingEndDateTimestamp", new Date(endDateUTC)] },
                ],
              },
              "$bookingDuration", // Use full duration if booking spans the entire selected date
              {
                $cond: [
                  // 2. check if booking starts on or after the selected date
                  {
                    $gte: [
                      "$bookingStartDateTimestamp",
                      new Date(startDateUTC),
                    ],
                  },
                  // if it does, calculate the duration from the start of selected date to the end of booking date
                  {
                    $divide: [
                      {
                        $subtract: [
                          new Date(endDateUTC),
                          "$bookingStartDateTimestamp",
                        ],
                      },
                      3600000,
                    ],
                  }, // Convert to hours
                  // if it doesn't, calculate the duration from booking start date to the end of the selected date
                  {
                    $divide: [
                      {
                        $subtract: [
                          "$bookingEndDateTimestamp",
                          new Date(startDateUTC),
                        ],
                      },
                      3600000,
                    ],
                  }, // Convert to hours
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
    let bookingsByHall: Array<any> = [];

    if (bookings && bookings.length !== 0) {
      bookings.forEach((booking: any) => {
        bookingsByHall[booking.hallId] = booking;
      });
    } else {
      bookingsByHall = [];
    }

    // Calculate availability status for each hall
    const hallAvailability = allHalls.map((hall: any) => {
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

    return new Response(JSON.stringify(hallAvailability), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
