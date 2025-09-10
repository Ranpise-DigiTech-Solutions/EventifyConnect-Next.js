import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { eventTypes } from "@/app/api/schemas";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    await connectDB(); // check database connection

    const { eventNames }: { eventNames: Array<string> } = await req.json();
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

    if (!eventNames || !Array.isArray(eventNames)) {
      return new Response(
        JSON.stringify({ message: "Required body attachment missing!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const documents: any = await eventTypes.find({
      eventName: { $in: eventNames },
    });

    if (documents.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No documents found for the provided event names",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create an object mapping event names to event IDs
    const eventIdsMap: { [key: string]: string } = {};

    documents.forEach((document: { eventName: string; _id: string }) => {
      eventIdsMap[document.eventName] = document._id;
    });

    // Create an array of event IDs in the same order as the input event names
    const eventIds = eventNames.map((eventName) => eventIdsMap[eventName]);

    return new Response(JSON.stringify(eventIds), {
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
