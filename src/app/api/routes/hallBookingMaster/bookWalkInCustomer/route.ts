import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import mongoose from "mongoose";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/db/firebase";
import { hallBookingMaster } from "@/app/api/schemas";
import axios from "axios";

// Helper function to check if a string is a valid ObjectId
function isObjectIdFormat(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

export async function POST(req: NextRequest) {
  const postData = await req.json();
  const captchaToken = req.headers.get("X-Captcha-Token");

  if (!captchaToken) {
    return new Response(JSON.stringify({ message: "Missing captcha token!" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // check weather the user is valid
  const reCaptchaResponse = await axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/reCaptchaValidation/v3/`,
    data: {
      token: captchaToken,
    },
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
  });

  if (reCaptchaResponse.data.success === false) {
    return new Response(
      JSON.stringify({ message: "Invalid reCAPTCHA response" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!postData || postData.length === 0) {
    return new Response(
      JSON.stringify({ message: "Body attachment are missing!!" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    await connectDB(); // check database connection

    const { hallId, vendorTypeId, eventId, hallUserId } = postData;

    // Validate customerId
    if (
      !isObjectIdFormat(hallId) ||
      !isObjectIdFormat(vendorTypeId) ||
      !isObjectIdFormat(eventId) ||
      !isObjectIdFormat(hallUserId)
    ) {
      return new Response(
        JSON.stringify({
          message:
            "The server was unable to process the request due to invalid format of some fields!!",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const hallObjectId = new mongoose.Types.ObjectId(postData.hallId);
    const vendorTypeObjectId = new mongoose.Types.ObjectId(
      postData.vendorTypeId
    );
    const eventTypeObjectId = new mongoose.Types.ObjectId(postData.eventId);
    const hallUserObjectId = new mongoose.Types.ObjectId(postData.hallUserId);

    // to get the updated booking id from firebase
    const docRef = doc(firestore, "counters", "bookingMasterId");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new Response(
        JSON.stringify({
          message: "Counter not accessible in firebase firestore!!",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = docSnap.data();
    const prevId = data.currentId;
    const newId = prevId + 1;

    const updatedData = {
      documentId: parseInt(newId),
      ...postData,
      hallId: hallObjectId,
      vendorTypeId: vendorTypeObjectId,
      eventId: eventTypeObjectId,
      hallUserId: hallUserObjectId,
    };

    const newDocument = new hallBookingMaster(updatedData);
    if (!newDocument) {
      return new Response(
        JSON.stringify({
          message: "Couldn't create booking. Something went wrong!",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const savedDocument = await newDocument.save();

    // Update the Firestore document with the new ID
    await updateDoc(docRef, { currentId: newId });

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
