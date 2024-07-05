import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { eventTypes } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  const filter = {};

  try {
    await connectDB(); // check database connection

    const eventDetails = await eventTypes.find(filter);

    if (!eventDetails) {
      return new Response(JSON.stringify({ message: "No event details found found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(eventDetails), {
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

export async function POST(req: NextRequest) {
  try {
    await connectDB(); // check database connection

    const reqBody : any = await req.json();

    if(!reqBody || reqBody.length === 0) {
        return new Response(JSON.stringify({ message: "Required body attachment not found!!" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          })
    }

     const newDocument = new eventTypes(req.body);

    if (!newDocument) {
      return new Response(JSON.stringify({ message: "No event details found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(newDocument), {
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