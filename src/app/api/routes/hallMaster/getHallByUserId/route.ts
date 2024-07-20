import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import mongoose from "mongoose";
import { hallMaster } from "@/app/api/schemas";
import axios from "axios";

export async function GET(req: NextRequest) {
  const filter: any = {};
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

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

  try {
    await connectDB(); // check database connection

    if (!userId) {
      return new Response(JSON.stringify({ message: "Hall ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const hallUserObjectId = new mongoose.Types.ObjectId(userId);
      filter["hallUserId"] = hallUserObjectId;
    }

    const hallDetails = await hallMaster.find(filter);

    if (!hallDetails || hallDetails.length === 0) {
      return new Response(JSON.stringify({ message: "Hall not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
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
