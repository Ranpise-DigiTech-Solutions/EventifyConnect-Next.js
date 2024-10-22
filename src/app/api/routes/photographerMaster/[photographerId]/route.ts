import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { photographerMaster } from "@/app/api/schemas";
import axios from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: { photographerId: string } }
) {
  const filter: any = {};

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

    if (!params.photographerId) {
      return new Response(JSON.stringify({ message: "Photographer ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const photographerObjectId = new mongoose.Types.ObjectId(params.photographerId);
      filter["_id"] = photographerObjectId;
    }

    const photographerDetails = await photographerMaster.find(filter);

    if (!photographerDetails || photographerDetails.length === 0) {
      return new Response(JSON.stringify({ message: "Photographer not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(photographerDetails), {
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
  { params }: { params: { photographerId: string } }
) {
  const updatedFields = await req.json();
  let photographerObjectId;

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

  if (!params.photographerId) {
    return new Response(JSON.stringify({ message: "Photographer ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    photographerObjectId = new mongoose.Types.ObjectId(params.photographerId);
  }

  if (!updatedFields || updatedFields.length === 0) {
    return new Response(JSON.stringify({ message: "Data is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectDB(); // check database connection

    const updatedResource = await photographerMaster.findOneAndUpdate(
      { _id: photographerObjectId },
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedResource || updatedResource.length === 0) {
      return new Response(JSON.stringify({ message: "Photographer not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedResource), {
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { photographerId: string } }
) {
  let photographerObjectId;

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

  if (!params.photographerId) {
    return new Response(JSON.stringify({ message: "Photographer ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    photographerObjectId = new mongoose.Types.ObjectId(params.photographerId);
  }

  try {
    await connectDB(); // check database connection

    const deletedPhotographer = await photographerMaster.findByIdAndDelete(photographerObjectId);

    if (!deletedPhotographer || deletedPhotographer.length === 0) {
      return new Response(JSON.stringify({ message: "Photographer not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Document deleted successfully.",
        deletedPhotographer,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
