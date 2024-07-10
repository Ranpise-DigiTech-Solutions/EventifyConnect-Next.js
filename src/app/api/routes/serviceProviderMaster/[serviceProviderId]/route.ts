import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { serviceProviderMaster } from "@/app/api/schemas";

export async function GET(
  req: NextRequest,
  { params }: { params: { serviceProviderId: string } }
) {
  try {
    await connectDB(); // check database connection

    if (!params.serviceProviderId) {
      return new Response(
        JSON.stringify({ message: "Service Provider ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const serviceProviderObjectId = new mongoose.Types.ObjectId(
      params.serviceProviderId
    );

    const serviceProviderDetails = await serviceProviderMaster.findById(
      serviceProviderObjectId
    );

    if (!serviceProviderDetails || serviceProviderDetails.length === 0) {
      return new Response(JSON.stringify({ message: "Hall not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(serviceProviderDetails), {
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
