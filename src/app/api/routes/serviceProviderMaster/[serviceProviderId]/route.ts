import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { serviceProviderMaster } from "@/app/api/schemas";
import axios from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: { serviceProviderId: string } }
) {
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
      
    if (!params.serviceProviderId) {
      return new Response(
        JSON.stringify({ message: "Service Provider ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const serviceProviderObjectId = new mongoose.Types.ObjectId(
      params.serviceProviderId
    );

    const serviceProviderDetails = await serviceProviderMaster.findById(
      serviceProviderObjectId
    );

    if (!serviceProviderDetails || serviceProviderDetails.length === 0) {
      return new Response(JSON.stringify({ message: "Hall not found" }), {
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { serviceProviderId: string } }
) {
  // const captchaToken = req.headers.get("X-Captcha-Token");

  // if (!captchaToken) {
  //   return new Response(JSON.stringify({ message: "Missing captcha token!" }), {
  //     status: 401,
  //     headers: { "Content-Type": "application/json" },
  //   });
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

  const updatedFields = await req.json();
  let serviceProviderObjectId;

  if (!params.serviceProviderId) {
    return new Response(JSON.stringify({ message: "Hall ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    serviceProviderObjectId = new mongoose.Types.ObjectId(
      params.serviceProviderId
    );
  }

  if (!updatedFields || updatedFields.length === 0) {
    return new Response(JSON.stringify({ message: "Data is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectDB(); // check database connection

    const updatedServiceProvider =
      await serviceProviderMaster.findByIdAndUpdate(
        { _id: serviceProviderObjectId }, // Query for finding the document
        { $set: updatedFields }, // Use $set operator to update existing fields and add new ones
        { new: true, upsert: true } // Set new and upsert options to true
      );

    if (!updatedServiceProvider || updatedServiceProvider.length === 0) {
      return new Response(JSON.stringify({ message: "Hall not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedServiceProvider), {
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
