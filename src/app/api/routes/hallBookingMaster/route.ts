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

export async function POST(req: NextRequest) {
  const reqBody = await req.json();

  if (!reqBody || reqBody.length === 0) {
    return new Response(
      JSON.stringify({ message: "Required body attachment not found!!" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    await connectDB(); // check database connection

    const newDocument = new hallBookingMaster(reqBody);
    const savedDocument = await newDocument.save();

    if (!savedDocument) {
      return new Response(
        JSON.stringify({ message: "Sorry! operation failed." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(savedDocument), {
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