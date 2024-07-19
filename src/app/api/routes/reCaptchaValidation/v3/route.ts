import { NextRequest } from "next/server";
import axios from 'axios';

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  "error-codes"?: string[];
}

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const SECRET_KEY: string = process.env.GOOGLE_V3_RECAPTCHA_SECRET_KEY || "";

  if (!token) {
    return new Response(JSON.stringify({ message: "Invalid site token!!" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = `secret=${SECRET_KEY}&response=${token}`;

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      }
    );

    if (response && response.data?.success && response.data?.score > 0.5) {
      return new Response(
        JSON.stringify({ success: true, score: response.data.score, message: "User verified successfully!" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to verify reCAPTCHA. Please try again."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error!" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
