import type { NextRequest } from "next/server";
import { NextResponse } from "next/server"; // Added NextResponse import
import connectDB from "@/lib/db/mongodb";
import { customerMaster } from "@/app/api/schemas";
import mongoose from "mongoose";
import axios from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    await connectDB(); // check database connection

    //const captchaToken = req.headers.get("X-Captcha-Token");
    
    // The fix: Await `params` before destructuring.
    const { customerId } = await params;

    // if (!captchaToken) {
    //   return NextResponse.json(
    //     { message: "Missing captcha token!" },
    //     {
    //       status: 401,
    //     }
    //   );
    // }

    // check weather the user is valid
    // const reCaptchaResponse = await axios({
    //   method: "POST",
    //   url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/reCaptchaValidation/v3/`,
    //   // The fix: Removed the extra curly braces.
    //   data: {
    //     token: captchaToken,
    //   },
    //   headers: {
    //     Accept: "application/json, text/plain, */*",
    //     "Content-Type": "application/json",
    //   },
    // });

    // if (reCaptchaResponse.data.success === false) {
    //   return NextResponse.json(
    //     { message: "Invalid reCAPTCHA response" },
    //     {
    //       status: 400,
    //     }
    //   );
    // }

    if (!customerId) {
      return NextResponse.json({ message: "Invalid customerId!" }, {
        status: 400,
      });
    }

    const customer = await customerMaster.findById(customerId);

    if (!customer) {
      return NextResponse.json(
        {
          message: "Couldn't find any customer data with the given id!",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(customer, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    await connectDB(); // check database connection

    // The fix: Await `params` before destructuring.
    const { customerId } = await params;
    const updatedData = await req.json();

    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json({ message: "Invalid customerId!" }, {
        status: 400,
      });
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return NextResponse.json(
        { message: "No data provided to update!" },
        {
          status: 400,
        }
      );
    }

    const updatedCustomer = await customerMaster.findByIdAndUpdate(
      { _id: customerId },
      { $set: updatedData },
      { new: true, upsert: true }
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        {
          message: "Couldn't find any customer data with the given id!",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(updatedCustomer, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}
