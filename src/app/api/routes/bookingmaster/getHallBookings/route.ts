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
    const hallId = searchParams.get("hallId");
    const startDateOfMonth = searchParams.get("startDateOfMonth");
    const endDateOfMonth = searchParams.get("endDateOfMonth");
    const sortCriteria = searchParams.get("sortCriteria");
    const bookingCategory = searchParams.get("bookingCategory");

    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "0");
    const skip = page * limit;

    // Validate customerId
    if (!hallId || !isObjectIdFormat(hallId)) {
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

    const hallObjectId = new ObjectId(hallId);

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
      // Pipeline for bookingMaster
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
        $unwind: {
          path: "$customerMaster",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$eventType",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          customerName: "$customerMaster.customerName",
          eventName: "$eventType.eventName",
          bookingId: "$_id",
        },
      },
      {
        $match: {
          hallId: hallObjectId,
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
        $unionWith: {
          coll: "hallbookingmasters",
          pipeline: [
            {
              $match: {
                hallId: hallObjectId,
                bookingStatus:
                  bookingCategory === "PENDING"
                    ? bookingCategory
                    : { $exists: true },
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
                      {
                        bookingStartDateTimestamp: {
                          $lte: new Date(endDateUTC),
                        },
                      },
                      {
                        bookingEndDateTimestamp: {
                          $gte: new Date(startDateUTC),
                        },
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        bookingStartDateTimestamp: {
                          $lte: new Date(endDateUTC),
                        },
                      },
                      { bookingEndDateTimestamp: null },
                    ],
                  },
                ],
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
              $unwind: {
                path: "$customerMaster",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$eventType",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                customerName:
                  "$customerName" === null
                    ? "$customerMaster.customerName"
                    : "$customerName",
                eventName: "$eventType.eventName",
              },
            },
            {
              $addFields: {
                bookingId: "$_id",
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: "$bookingId",
          document: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$document",
        },
      },
      {
        $addFields: {
          sortKey: {
            $switch: {
              branches: [
                { case: { $eq: [sortCriteria, "bookingId"] }, then: "$_id" },
                {
                  case: { $eq: [sortCriteria, "customerName"] },
                  then: "$customerName",
                },
                {
                  case: { $eq: [sortCriteria, "eventType"] },
                  then: "$eventName",
                },
                {
                  case: { $eq: [sortCriteria, "customerType"] },
                  then: "$customerType",
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
                customerName: 1,
                customerType: 1,
                eventName: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
      {
        $project: {
          bookings: 1,
          total: 1,
        },
      },
    ]);
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
