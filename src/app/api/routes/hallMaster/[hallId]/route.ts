import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { hallMaster } from "@/app/api/schemas";
import axios from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: { hallId: string } }
) {
  const filter: any = {};

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

    if (!params.hallId) {
      return new Response(JSON.stringify({ message: "Hall ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const hallObjectId = new mongoose.Types.ObjectId(params.hallId);
      filter["_id"] = hallObjectId;
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { hallId: string } }
) {
  const updatedFields = await req.json();
  let hallObjectId;

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

  if (!params.hallId) {
    return new Response(JSON.stringify({ message: "Hall ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    hallObjectId = new mongoose.Types.ObjectId(params.hallId);
  }

  if (!updatedFields || updatedFields.length === 0) {
    return new Response(JSON.stringify({ message: "Data is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectDB(); // check database connection

    const updatedResource = await hallMaster.findOneAndUpdate(
      { _id: hallObjectId },
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedResource || updatedResource.length === 0) {
      return new Response(JSON.stringify({ message: "Hall not found" }), {
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
  { params }: { params: { hallId: string } }
) {
  let hallObjectId;

  const captchaToken = req.headers.get("X-Captcha-Token");

  if (!captchaToken) {
    return new Response(JSON.stringify({ message: "Missing captcha token!" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  if (!params.hallId) {
    return new Response(JSON.stringify({ message: "Hall ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    hallObjectId = new mongoose.Types.ObjectId(params.hallId);
  }

  try {
    await connectDB(); // check database connection

    const deletedHall = await hallMaster.findByIdAndDelete(hallObjectId);

    if (!deletedHall || deletedHall.length === 0) {
      return new Response(JSON.stringify({ message: "Hall not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Document deleted successfully.",
        deletedHall,
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
