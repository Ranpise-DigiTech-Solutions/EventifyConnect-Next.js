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
    console.log(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


export async function GET(req: NextRequest) {
  const filter = {};

  try {
    await connectDB(); // check database connection

    const vendorDetails = await vendorMaster.find(filter);

    if (!vendorDetails) {
      return new Response(JSON.stringify({ message: "No venue details were found" }), {
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