import connectDB from "@/lib/db/mongodb"
import { catererMaster } from "@/app/api/schemas/caterer-master"; // Assuming you have a Mongoose model at this path
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Connect to the database
  await connectDB();

  try {
    const postBody = await req.json();
    
    // Create a new caterer document using the Mongoose model
    const newCaterer = new catererMaster({
      ...postBody,
    });

    // Save the document to the database
    await newCaterer.save();

    return NextResponse.json({
      success: true,
      message: "Caterer registration successful!",
      data: newCaterer,
    }, { status: 201 });

  } catch (error) {
    // Handle validation errors or other database errors
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    console.error(error); // Log the full error for debugging

    return NextResponse.json({
      success: false,
      message: "An error occurred during registration.",
      error: errorMessage,
    }, { status: 500 });
  }
}