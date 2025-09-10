import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { customerMaster } from "@/app/api/schemas";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const filter = {};

  try {
    await connectDB(); // check database connection

    const customerCount = await customerMaster.countDocuments(filter);

    if (typeof customerCount !== "number") {
      return NextResponse.json({ message: "No data found!" }, { status: 404 });
    }

    return NextResponse.json(customerCount, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}