import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { eventTypes } from "@/app/api/schemas";

export async function GET(req: NextRequest, { params } : { params : { eventId: string }}) {
  try {
    await connectDB(); // check database connection

    const eventId : string = params.eventId;

    if(!eventId) {
        return new Response(JSON.stringify({ message: "Event ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    const eventDetails = await eventTypes.findById(eventId);

    if (!eventDetails) {
      return new Response(JSON.stringify({ message: "No event details found found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const eventName = eventDetails.eventName;

    return new Response(JSON.stringify(eventName), {
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