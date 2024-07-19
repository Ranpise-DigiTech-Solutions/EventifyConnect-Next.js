import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { venueTypes } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  const filter = {};

  try {
    await connectDB(); // check database connection

    const venueDetails = await venueTypes.find(filter);

    if (!venueDetails) {
      return new Response(JSON.stringify({ message: "No venue details were found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(venueDetails), {
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