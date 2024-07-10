import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { hallMaster } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  try {
    await connectDB(); // check database connection
    const hallCount = await hallMaster.countDocuments({});

    if (typeof hallCount !== "number") {
      return new Response(
        JSON.stringify({ message: "Connection to server failed." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(hallCount), {
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
