import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import axios from "axios";
import { hallBookingMaster } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  const filter = {};

  try {
    await connectDB(); // check database connection

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

    // // check weather the user is valid
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

    const hallBookingMasterData: any = await hallBookingMaster.find(filter);

    if (!hallBookingMasterData || hallBookingMasterData.length === 0) {
      return new Response(
        JSON.stringify({ message: "No hall details found found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(hallBookingMasterData), {
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

  // const captchaToken = req.headers.get("X-Captcha-Token");

  // if (!captchaToken) {
  //   return new Response(JSON.stringify({ message: "Missing captcha token!" }), {
  //     status: 401,
  //     headers: { "Content-Type": "application/json" },
  //   });
  // }

  // // check weather the user is valid
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

    const newDocument = new hallBookingMaster(reqBody);
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
