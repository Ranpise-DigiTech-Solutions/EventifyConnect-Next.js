import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { vendorTypes } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  try {
    await connectDB(); // check database connection

    const vendorDetails = await vendorTypes.find({});

    if (!vendorDetails || vendorDetails.length === 0) {
      return NextResponse.json(
        { message: "No vendor type details were found" },
        { status: 404 }
      );
    }

    return NextResponse.json(vendorDetails, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();

    if (!reqBody || Object.keys(reqBody).length === 0) {
      return NextResponse.json(
        { message: "Required body attachment not found!!" },
        { status: 404 }
      );
    }

    await connectDB(); // check database connection

    const newDocument = new vendorTypes(reqBody);
    const savedDocument = await newDocument.save();

    if (!savedDocument) {
      return NextResponse.json(
        { message: "Sorry! operation failed." },
        { status: 404 }
      );
    }

    return NextResponse.json(savedDocument, { status: 200 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}