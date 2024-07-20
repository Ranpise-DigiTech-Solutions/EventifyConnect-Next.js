import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import axios from "axios";
import { hallMaster } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hallCity = searchParams.get("hallCity");
  const eventId = searchParams.get("eventId");
  let specificObjectId: any;
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

  function isObjectIdFormat(str: string) {
    return /^[0-9a-fA-F]{24}$/.test(str);
  }

  if (eventId && isObjectIdFormat(eventId)) {
    specificObjectId = new ObjectId(eventId);
    if (!ObjectId.isValid(specificObjectId)) {
      specificObjectId = null;
    }
  } else {
    specificObjectId = null;
  }

  if (!specificObjectId) {
    return new Response(
      JSON.stringify({ message: "Required attachments not found!!" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    await connectDB(); // check database connection

    const hallDetails = await hallMaster.aggregate([
      {
        $match: {
          hallCity: hallCity ? hallCity : { $exists: true },
          hallEventTypes: specificObjectId
            ? { $in: [specificObjectId] }
            : { $exists: true },
        },
      },
    ]);
    if (!hallDetails) {
      return new Response(
        JSON.stringify({ message: "No hall details found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(hallDetails), {
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
  const reqBody = await req.json();

  if (!reqBody || reqBody.length === 0) {
    return new Response(
      JSON.stringify({ message: "Required body attachment not found!!" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    await connectDB(); // check database connection

    const captchaToken = req.headers.get("X-Captcha-Token");

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

    const { hallParking, ...hallData } = reqBody;
    const postBody = {
      ...hallData,
      hallParking: hallParking === "AVAILABLE",
    };

    const newDocument = new hallMaster(postBody);
    const savedDocument = await newDocument.save();

    if (!savedDocument) {
      return new Response(
        JSON.stringify({ message: "Sorry! operation failed." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
