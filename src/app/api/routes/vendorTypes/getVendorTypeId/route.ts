import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import axios from "axios";
import { vendorTypes } from "@/app/api/schemas";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vendorType = searchParams.get("vendorType");

  //const captchaToken = req.headers.get("X-Captcha-Token");

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

  if (!vendorType) {
    return new Response(
      JSON.stringify({
        error: "Missing vendorType parameter",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await connectDB(); // check database connection

    var document = await vendorTypes.findOne({ vendorType: vendorType });

    if (!document) {
      return new Response(
        JSON.stringify({ message: "No vendor type details were found" }),
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
