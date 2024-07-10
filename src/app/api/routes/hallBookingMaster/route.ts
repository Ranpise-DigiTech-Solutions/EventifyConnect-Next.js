import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { hallBookingMaster } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
    const filter = {}

  try {
    await connectDB(); // check database connection

    const hallBookingMasterData: any = await hallBookingMaster.find(filter);

    if (!hallBookingMasterData || hallBookingMasterData.length === 0) {
      return new Response(
        JSON.stringify({ message: "No hall details found found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(hallBookingMasterData), {
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