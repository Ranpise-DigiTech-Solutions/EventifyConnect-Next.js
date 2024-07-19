import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { customerMaster } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  const filter = {};

  try {
    await connectDB(); // check database connection

    const customerDetails = await customerMaster.find(filter);

    if (!customerDetails) {
      return new Response(JSON.stringify({ message: "No customer found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(customerDetails), {
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

    const newDocument = new customerMaster(postBody);
    const savedDocument = await newDocument.save(); // Save the document

    if (!savedDocument) {
      return new Response(JSON.stringify({ message: "New document couldn't be created!" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
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
