import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { serviceProviderMaster } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  const filter = {};

  try {
    await connectDB(); // check database connection

    const serviceProviderDetails = await serviceProviderMaster.find(filter);

    if (!serviceProviderDetails) {
      return new Response(JSON.stringify({ message: "No customer found" }), {
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

export async function POST(req: NextRequest) {
  try {
    await connectDB(); // check database connection

    const postBody = await req.json();

    if(postBody && postBody.length === 0) {
        return new Response(JSON.stringify({ message: "No customer data provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    const newDocument = new serviceProviderMaster(postBody);

    if (!newDocument) {
      return new Response(JSON.stringify({ message: "New document couldn't be created!" }), {
        status: 500,
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
