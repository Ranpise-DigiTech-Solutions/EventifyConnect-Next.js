import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { serviceProviderMaster } from "@/app/api/schemas";
import axios from "axios";

export async function GET(req: NextRequest) {
  const filter = {};

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

    const serviceProviderDetails = await serviceProviderMaster.find(filter);

    if (!serviceProviderDetails) {
      return new Response(JSON.stringify({ message: "No customer found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(serviceProviderDetails), {
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
  const captchaToken = req.headers.get("X-Captcha-Token");
  const programType = req.headers.get('Program-Type');

  if(programType !== "SERVER") {

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
  }

  try {
    await connectDB(); // check database connection

    const postBody = await req.json();

    if (!postBody || postBody.length === 0) {
      return new Response(
        JSON.stringify({ message: "No customer data provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newDocument = new serviceProviderMaster(postBody);
    const savedDocument = await newDocument.save(); // Save the document

    if (!savedDocument) {
      return new Response(
        JSON.stringify({ message: "New document couldn't be created!" }),
        {
          status: 500,
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
