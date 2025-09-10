import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { bookingMaster } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  const filter = {};

  try {
    await connectDB(); // check database connection

    const bookingCount = await bookingMaster.countDocuments(filter);

    if (typeof bookingCount !== "number") {
      return NextResponse.json(
        { message: "Connection to server failed!" },
        { status: 500 }
      );
    }

    return NextResponse.json(bookingCount, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}