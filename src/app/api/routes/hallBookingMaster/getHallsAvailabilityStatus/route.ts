import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { hallBookingMaster, hallMaster } from "@/app/api/schemas";

// Function to determine sort criteria
function getSortCriteria(filter: string): any {
  switch (filter) {
    case "Oldest":
      return { createdTime: 1 as 1 };
    case "Most Liked":
      return { hallLikesCount: -1 as -1 };
    case "Most Popular":
      return { hallMaxBookings: -1 as -1 };
    case "Top Rated":
      return { hallUserRating: -1 as -1 };
    default:
      return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const selectedDate = searchParams.get("selectedDate") || "";
  const selectedCity = searchParams.get("selectedCity") || "";
  const eventId = searchParams.get("eventId") || "";
  const filter = searchParams.get("filter") || "";

  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "0");
  const skip = page * limit;

  try {
    if (!selectedCity || !selectedDate || !filter) {
      return NextResponse.json(
        { message: "All required parameters are missing!!" },
        {
          status: 400,
        }
      );
    }

    let eventObjectId = null;

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

    await connectDB();

    const allHallsPipeline: Array<any> = [
      ...(sortCriteria ? [{ $sort: sortCriteria }] : []),
      {
        $match: {
          hallCity: selectedCity ? selectedCity : { $exists: true },
          hallEventTypes: eventObjectId
            ? { $in: [eventObjectId] }
            : { $exists: true },
        },
      },
      {
        $facet: {
          hallData: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                hallName: 1,
                hallTaluk: 1,
                hallCity: 1,
                hallState: 1,
                hallImages: 1,
                hallDescription: 1,
                hallVegRate: 1,
                hallNonVegRate: 1,
                hallCapacity: 1,
                hallRooms: 1,
                hallParking: 1,
                hallFreezDay: 1,
                hallUserRating: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const allHalls: Array<any> = await hallMaster.aggregate(allHallsPipeline);
    const hallIds = allHalls[0].hallData?.map((hall: any) => hall?._id);

    if (!hallIds || hallIds.length === 0) {
      return NextResponse.json({ data: [], totalCount: 0 }, { status: 200 });
    }

    const startDate = new Date(selectedDate + "T00:00:00.000Z");
    const endDate = new Date(selectedDate + "T23:59:59.999Z");

    const startDateUTC = new Date(
      startDate.getTime() + startDate.getTimezoneOffset() * 60000
    );
    const endDateUTC = new Date(
      endDate.getTime() + endDate.getTimezoneOffset() * 60000
    );

    const bookings = await hallBookingMaster.aggregate([
      {
        $match: {
          hallId: { $in: hallIds },
          bookingStartDateTimestamp: { $lte: endDateUTC },
          bookingEndDateTimestamp: { $gte: startDateUTC },
          hallCity: selectedCity ? selectedCity : { $exists: true },
          eventId: eventObjectId ? eventObjectId : { $exists: true },
        },
      },
      {
        $project: {
          hallId: 1,
          totalDuration: {
            $divide: [
              {
                $subtract: [
                  { $min: ["$bookingEndDateTimestamp", endDateUTC] },
                  { $max: ["$bookingStartDateTimestamp", startDateUTC] },
                ],
              },
              3600000,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$hallId",
          totalDuration: { $sum: "$totalDuration" },
        },
      },
    ]);

    const bookingsMap = new Map();
    bookings.forEach((booking: any) => {
      bookingsMap.set(booking._id.toString(), booking.totalDuration);
    });

    const hallAvailability = allHalls[0].hallData?.map((hall: any) => {
      const totalDuration = bookingsMap.get(hall._id.toString()) || 0;
      let availabilityStatus = "AVAILABLE";

      if (totalDuration > 18) {
        availabilityStatus = "UNAVAILABLE";
      } else if (totalDuration > 0) {
        availabilityStatus = "LIMITED AVAILABILITY";
      }

      return {
        ...hall,
        hallId: hall._id,
        availability: availabilityStatus,
      };
    });

    return NextResponse.json(
      {
        data: hallAvailability,
        totalCount: allHalls[0]?.total[0]?.count,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}