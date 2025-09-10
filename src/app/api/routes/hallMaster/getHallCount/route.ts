import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { hallMaster } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  try {
    await connectDB(); // Check database connection

    const hallCount = await hallMaster.countDocuments({});

    if (typeof hallCount !== "number") {
      return NextResponse.json(
        { message: "Connection to server failed." },
        { status: 404 }
      );
    }

    return NextResponse.json(hallCount, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}