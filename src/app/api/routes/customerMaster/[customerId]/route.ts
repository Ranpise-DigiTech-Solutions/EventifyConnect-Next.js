import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { customerMaster } from "@/app/api/schemas";

export async function GET(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    await connectDB(); // check database connection

    const customerId = params.customerId;

    if (!customerId) {
      return new Response(JSON.stringify({ message: "Invalid customerId!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const customer = await customerMaster.findById(customerId);

    if (!customer) {
      return new Response(JSON.stringify({ message: "Couldn't find any customer data with the given id!" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(customer), {
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    await connectDB(); // check database connection

    const customerId = params.customerId;
    const updatedData = await req.json();

    if (!customerId) {
      return new Response(JSON.stringify({ message: "Invalid customerId!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if(!updatedData || updatedData.length === 0) {
        return new Response(JSON.stringify({ message: "No data provided to update!" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    const updatedCustomer = await customerMaster.findByIdAndUpdate(
        { _id: customerId},
        { $set: updatedData },
        { new: true ,upsert: true}
    );

    if (!updatedCustomer) {
      return new Response(JSON.stringify({ message: "Couldn't find any customer data with the given id!" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedCustomer), {
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
