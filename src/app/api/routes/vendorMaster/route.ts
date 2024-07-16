import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { vendorMaster } from "@/app/api/schemas";

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

    const newDocument = new vendorMaster(reqBody);

    if (!newDocument) {
      return new Response(
        JSON.stringify({ message: "Sorry! operation failed." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const savedDocument = await newDocument.save();

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