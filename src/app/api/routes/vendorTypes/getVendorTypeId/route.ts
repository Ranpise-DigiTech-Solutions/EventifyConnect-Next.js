import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { vendorTypes } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const vendorType = searchParams.get('vendorType');

    if(!vendorType) {
        return new Response(
            JSON.stringify({
              error: "Missing vendorType parameter",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

  try {
    await connectDB(); // check database connection

    var document = await vendorTypes.findOne({ "vendorType": vendorType });

    if (!document) {
      return new Response(JSON.stringify({ message: "No vendor type details were found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    var documentId = document._id;

    return new Response(JSON.stringify(documentId), {
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