import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { vendorMaster } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const otherVendorsCount = await vendorMaster.countDocuments({});

    if (typeof otherVendorsCount !== "number") {
      return NextResponse.json(
        { message: "Connection to server failed." },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(otherVendorsCount, {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}