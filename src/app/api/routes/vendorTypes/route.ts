import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { vendorTypes } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  const filter = {};

  try {
    await connectDB(); // check database connection

    const vendorDetails = await vendorTypes.find(filter);

    if (!vendorDetails) {
      return new Response(JSON.stringify({ message: "No event details found found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(vendorDetails), {
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