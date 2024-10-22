import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { bookingMaster } from "@/app/api/schemas";
import mongoose from "mongoose";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/db/firebase";
import axios from "axios";

export async function GET(req: NextRequest) {
  const filter = {};
  const captchaToken = req.headers.get("X-Captcha-Token");
  try {
    await connectDB(); // check database connection

    if (!captchaToken) {
      return new Response(
        JSON.stringify({ message: "Missing captcha token!" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
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

    const bookings = await bookingMaster.find(filter);

    if (!bookings) {
      return new Response(JSON.stringify({ message: "No bookings found!" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(bookings), {
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
  await connectDB(); // check database connection
  try {
    const postBody: any = await req.json();
    const captchaToken = req.headers.get("X-Captcha-Token");

    console.log(postBody);

    if (!captchaToken) {
      return new Response(
        JSON.stringify({ message: "Missing captcha token!" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
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

    if (!postBody) {
      return new Response(
        JSON.stringify({
          message: "Required body attachments not found!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const hallObjectId = new mongoose.Types.ObjectId(postBody.hallId);
    const vendorTypeObjectId = new mongoose.Types.ObjectId(
      postBody.vendorTypeId
    );
    const eventTypeObjectId = new mongoose.Types.ObjectId(postBody.eventId);
    const customerObjectId = new mongoose.Types.ObjectId(postBody.customerId);
    const hallUserObjectId = new mongoose.Types.ObjectId(postBody.hallUserId);

    // to get the updated booking id from firebase
    const docRef = doc(firestore, "counters", "bookingMasterId");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new Response(
        JSON.stringify({
          message: "Document not found!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = docSnap.data();
    const prevId = data.currentId;
    const newId = prevId + 1;

    const updatedData = {
      documentId: parseInt(newId),
      ...postBody,
      hallId: hallObjectId,
      vendorTypeId: vendorTypeObjectId,
      eventId: eventTypeObjectId,
      customerId: customerObjectId,
      hallUserId: hallUserObjectId,
    };

    const newDocument = new bookingMaster(updatedData);
    const savedDocument = await newDocument.save();
    if (!savedDocument) {
      return new Response(
        JSON.stringify({
          message: "Operation not found!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await updateDoc(docRef, { currentId: newId });

    return new Response(JSON.stringify(savedDocument), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
