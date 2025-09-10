import type { NextRequest } from "next/server";
import { bookingMaster } from "@/app/api/schemas";
import { ObjectId } from "mongodb";
import connectDB from "@/lib/db/mongodb";

// Helper function to check if a string is a valid ObjectId
function isObjectIdFormat(str: string) {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

export async function GET(req: NextRequest) {
  await connectDB(); // check database connection
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const startDateOfMonth = searchParams.get("startDateOfMonth");
    const endDateOfMonth = searchParams.get("endDateOfMonth");
    const sortCriteria = searchParams.get("sortCriteria");
    const bookingCategory = searchParams.get("bookingCategory");

    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "0");
    const skip = page * limit;

    // --- All reCAPTCHA-related code has been removed from this section ---

    // Validate customerId
    if (!customerId || !isObjectIdFormat(customerId)) {
      return new Response(
        JSON.stringify({
          message:
            "The server was unable to process the request due to invalid Customer Id.",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const customerObjectId = new ObjectId(customerId);

    // Validate dates
    if (!startDateOfMonth || !endDateOfMonth) {
      return new Response(
        JSON.stringify({
          message: "Start date and end date of the month are required.",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const startDateOfMonthObj = new Date(startDateOfMonth);
    const endDateOfMonthObj = new Date(endDateOfMonth);

    const startDateUTC = new Date(
      startDateOfMonthObj.getTime() +
      startDateOfMonthObj.getTimezoneOffset() * 60000
    ).toISOString();
    const endDateUTC = new Date(
      endDateOfMonthObj.getTime() +
      endDateOfMonthObj.getTimezoneOffset() * 60000
    ).toISOString();

    const bookings = await bookingMaster.aggregate([
      {
        $match: {
          customerId: customerObjectId,
          bookingStatus:
            bookingCategory === "PENDING" ? bookingCategory : { $exists: true },
          bookingStartDateTimestamp:
            bookingCategory === "UPCOMING"
              ? { $gt: new Date() }
              : { $exists: true },
          bookingEndDateTimestamp:
            bookingCategory === "COMPLETED"
              ? { $lt: new Date() }
              : { $exists: true },
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
                { bookingEndDateTimestamp: null },
              ],
            },
          ],
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
      {
        $addFields: {
          customerEmail: "$customerMaster.customerEmail",
          hallMainEmail: "$hallMaster.hallMainEmail",
          sortKey: {
            $switch: {
              branches: [
                { case: { $eq: [sortCriteria, "bookingId"] }, then: "$_id" },
                {
                  case: { $eq: [sortCriteria, "hallName"] },
                  then: "$hallMaster.hallName",
                },
                {
                  case: { $eq: [sortCriteria, "eventType"] },
                  then: "$eventType.eventName",
                },
                {
                  case: { $eq: [sortCriteria, "vendorType"] },
                  then: "$vendorType.vendorType",
                },
                {
                  case: { $eq: [sortCriteria, "bookingStartDate"] },
                  then: "$bookingStartDateTimestamp",
                },
                {
                  case: { $eq: [sortCriteria, "bookingDuration"] },
                  then: "$bookingDuration",
                },
                {
                  case: { $eq: [sortCriteria, "bookingStatus"] },
                  then: "$bookingStatus",
                },
              ],
              default: null,
            },
          },
        },
      },
      ...(sortCriteria !== ""
        ? sortCriteria === "bookingStartDate"
          ? [{ $sort: { sortKey: -1 as -1 } }]
          : [{ $sort: { sortKey: 1 as 1 } }]
        : []),
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
                customerEmail: 1,
                hallMainEmail: 1,
                vendorType: "$vendorType.vendorType",
                hallName: "$hallMaster.hallName",
                eventName: "$eventType.eventName",
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    console.log(bookings);

    return new Response(JSON.stringify(bookings), {
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