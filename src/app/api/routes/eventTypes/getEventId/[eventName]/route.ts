import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { eventTypes } from "@/app/api/schemas";
import axios from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventName: string } }
) {
  try {
    await connectDB(); // check database connection

    const eventName: string = params.eventName;
    // const captchaToken = req.headers.get("X-Captcha-Token");

    // if (!captchaToken) {
    //   return new Response(
    //     JSON.stringify({ message: "Missing captcha token!" }),
    //     {
    //       status: 401,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

    // check weather the user is valid
    // const reCaptchaResponse = await axios({
    //   method: "POST",
    //   url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/reCaptchaValidation/v3/`,
    //   data: {
    //     token: captchaToken,
    //   },
    //   headers: {
    //     Accept: "application/json, text/plain, */*",
    //     "Content-Type": "application/json",
    //   },
    // });

    // if (reCaptchaResponse.data.success === false) {
    //   return new Response(
    //     JSON.stringify({ message: "Invalid reCAPTCHA response" }),
    //     {
    //       status: 400,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

    if (!eventName) {
      return new Response(JSON.stringify({ message: "Event ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    var document = await eventTypes.findOne({ eventName: eventName });

    if (!document) {
      return new Response(
        JSON.stringify({
          message: "Not Found! No documents match your condition!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    var documentId = document._id;

    return new Response(JSON.stringify(documentId), {
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
